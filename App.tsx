import React, { useState, useMemo } from 'react';
import { Welcome } from './components/Welcome';
import { BookSelector } from './components/BookSelector';
import { Payment } from './components/Payment';
import { Confirmation } from './components/Confirmation';
import { AdminLogin } from './components/AdminLogin';
import { AdminView } from './components/AdminView';
import { CartItem, Order } from './types';
import { BOOKS } from './constants';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { fileToBase64 } from './utils/fileUtils';
import { exportToCsv } from './utils/csvUtils';

enum AppState {
  Welcome,
  BookSelection,
  Payment,
  Confirmation,
  AdminLogin,
  AdminView,
}

const handleServerError = async (response: Response): Promise<string> => {
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    try {
      const errorData = await response.json();
      return errorData.message || 'התקבלה שגיאה לא מזוהה מהשרת.';
    } catch (jsonError) {
      return 'התקבלה תגובת שגיאה לא תקינה מהשרת.';
    }
  }
  return `שגיאת שרת (${response.status}): ${response.statusText}`;
};

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.Welcome);
  const [studentName, setStudentName] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const handleNameSubmit = (name: string) => {
    setStudentName(name.trim());
    setAppState(AppState.BookSelection);
  };

  const handleAddToCart = (bookId: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === bookId);
      if (existingItem) {
        return prevCart.filter(item => item.id !== bookId);
      } else {
        const bookToAdd = BOOKS.find(b => b.id === bookId);
        if (bookToAdd) {
          return [...prevCart, { ...bookToAdd, quantity: 1 }];
        }
      }
      return prevCart;
    });
  };

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const handleProceedToPayment = () => {
    setSubmitError(null);
    setAppState(AppState.Payment);
  };
  
  const handleConfirmOrder = async (paymentDetails: { referenceNumber: string; receipt: File }) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const receiptBase64 = await fileToBase64(paymentDetails.receipt);

      const orderPayload = {
        studentName,
        cart,
        total,
        paymentReference: paymentDetails.referenceNumber,
        receipt: {
          name: paymentDetails.receipt.name,
          type: paymentDetails.receipt.type,
          data: receiptBase64,
        },
      };

      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const errorMessage = await handleServerError(response);
        throw new Error(errorMessage);
      }
      
      setAppState(AppState.Confirmation);

    } catch (error) {
       console.error("Submission error:", error);
       const errorMessage = error instanceof Error ? error.message : 'שגיאת רשת או שהשרת אינו זמין.';
       setSubmitError(`שליחת ההזמנה נכשלה. נא לנסות שוב. (פרטי שגיאה: ${errorMessage})`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLogin = async (password: string) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch('/api/get-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const errorMessage = await handleServerError(response);
        throw new Error(errorMessage);
      }

      const fetchedOrders: Order[] = await response.json();
      setOrders(fetchedOrders);
      setAppState(AppState.AdminView);
    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
       setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportOrders = () => {
    exportToCsv("orders.csv", orders);
  };

  const handleGoBackToSelection = () => setAppState(AppState.BookSelection);
  const handleGoBackToWelcome = () => setAppState(AppState.Welcome);
  const handleStartNewOrder = () => {
    setAppState(AppState.Welcome);
    setStudentName('');
    setCart([]);
    setSubmitError(null);
  };
  const handleNavigateToAdminLogin = () => {
    setSubmitError(null);
    setAppState(AppState.AdminLogin);
  };

  const renderContent = () => {
    switch(appState) {
      case AppState.Welcome:
        return <Welcome onNameSubmit={handleNameSubmit} />;
      case AppState.BookSelection:
        return (
            <BookSelector
              studentName={studentName}
              cart={cart}
              total={total}
              onAddToCart={handleAddToCart}
              onProceed={handleProceedToPayment}
              onBack={handleGoBackToWelcome}
            />
        );
      case AppState.Payment:
        return (
          <Payment 
            studentName={studentName}
            cart={cart}
            total={total}
            onConfirm={handleConfirmOrder}
            onBack={handleGoBackToSelection}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        );
      case AppState.Confirmation:
        return <Confirmation onNewOrder={handleStartNewOrder} />;
      case AppState.AdminLogin:
        return (
          <AdminLogin 
            onLogin={handleAdminLogin}
            isSubmitting={isSubmitting}
            error={submitError}
            onBack={handleStartNewOrder}
          />
        );
       case AppState.AdminView:
        return (
          <AdminView 
            orders={orders}
            onExport={handleExportOrders}
            onLogout={handleStartNewOrder}
          />
        );
      default:
        return <Welcome onNameSubmit={handleNameSubmit} />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <Header />
        <main className="mt-8 bg-white shadow-2xl rounded-2xl overflow-hidden">
          {renderContent()}
        </main>
        <Footer onAdminClick={handleNavigateToAdminLogin}/>
      </div>
    </div>
  );
}