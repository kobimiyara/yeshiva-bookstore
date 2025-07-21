
import { useState, useMemo, useEffect } from 'react';
import { Welcome } from './components/Welcome';
import { BookSelector } from './components/BookSelector';
import { PaymentFailure } from './components/PaymentFailure';
import { Confirmation } from './components/Confirmation';
import { AdminLogin } from './components/AdminLogin';
import { AdminView } from './components/AdminView';
import { CartItem, Order, Book } from './types';
import { BOOKS } from './constants';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { exportToCsv } from './utils/csvUtils';
import { SpinnerIcon } from './components/icons';

enum AppState {
  Welcome,
  BookSelection,
  PaymentInProgress,
  PaymentFailure,
  Confirmation,
  AdminLogin,
  AdminView,
}

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.Welcome);
  const [studentName, setStudentName] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // Used for AdminLogin
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const path = window.location.pathname;
    
    // Handle redirects from payment gateway
    if (path.startsWith('/payment/success')) {
      setAppState(AppState.Confirmation);
      window.history.replaceState({}, document.title, '/');
    } else if (path.startsWith('/payment/failure')) {
      setAppState(AppState.PaymentFailure);
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  const handleNameSubmit = (name: string) => {
    setStudentName(name.trim());
    setAppState(AppState.BookSelection);
  };

  const handleAddToCart = (bookId: number) => {
    const bookToAdd = BOOKS.find(b => b.id === bookId);
    if (!bookToAdd) return;

    setCart(prevCart => {
      let newCart = [...prevCart];
      const existingItemIndex = newCart.findIndex(item => item.id === bookId);

      if (existingItemIndex > -1) {
        // Item already in cart, so remove it (toggle off)
        newCart.splice(existingItemIndex, 1);
      } else {
        // Item not in cart, add it
        // Before adding, check if it belongs to a group and remove other group members
        if (bookToAdd.groupId) {
          newCart = newCart.filter(item => item.groupId !== bookToAdd.groupId);
        }
        newCart.push({ ...bookToAdd, quantity: 1 });
      }
      return newCart;
    });
  };

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const handleProceedToPayment = async () => {
    setAppState(AppState.PaymentInProgress);
    setSubmitError(null);

    try {
      const response = await fetch('/api/create-payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName, cart, total }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'התרחשה שגיאה ביצירת קישור התשלום.');
      }
      
      const { saleLink } = await response.json();
      if (saleLink) {
        window.location.href = saleLink; // Redirect user to payment page
      } else {
        throw new Error('לא התקבל קישור תשלום מהשרת.');
      }

    } catch (error) {
       console.error("Payment initiation error:", error);
       const errorMessage = error instanceof Error ? error.message : 'שגיאת רשת או שהשרת אינו זמין.';
       setSubmitError(`יצירת התשלום נכשלה. נא לנסות שוב. (פרטי שגיאה: ${errorMessage})`);
       setAppState(AppState.BookSelection);
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

      if (response.status === 401) {
        throw new Error('סיסמה שגויה.');
      }
      if (!response.ok) {
        throw new Error('שגיאה בגישה לנתונים.');
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

  const handleGoBackToWelcome = () => setAppState(AppState.Welcome);
  const handleTryAgain = () => {
    setSubmitError(null);
    setAppState(AppState.BookSelection);
  }
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
  
  const renderPaymentInProgress = () => (
    <div className="p-8 sm:p-12 text-center bg-white flex flex-col items-center justify-center min-h-[400px]">
        <SpinnerIcon className="h-16 w-16 text-blue-600 animate-spin mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">מעביר אותך לתשלום מאובטח...</h2>
        <p className="text-gray-600 mt-2">אנא המתן, התהליך עשוי לקחת מספר שניות.</p>
    </div>
  );

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
              error={submitError}
            />
        );
      case AppState.PaymentInProgress:
        return renderPaymentInProgress();
      case AppState.PaymentFailure:
        return <PaymentFailure onTryAgain={handleTryAgain} />;
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