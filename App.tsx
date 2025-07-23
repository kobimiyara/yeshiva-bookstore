import { useState, useMemo, useEffect } from 'react';
import { Welcome } from './components/Welcome';
import { BookSelector } from './components/BookSelector';
import { PaymentFailure } from './components/PaymentFailure';
import { Confirmation } from './components/Confirmation';
import { AdminLogin } from './components/AdminLogin';
import { AdminView } from './components/AdminView';
import { CartItem, Order } from './types';
import { BOOKS } from './constants';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

enum AppState {
  Welcome,
  BookSelection,
  PaymentFailure,
  Confirmation,
  AdminLogin,
  AdminView,
}

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.Welcome);
  const [studentName, setStudentName] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // This effect now handles all initial page load logic: deep-linking and payment redirects.
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const view = params.get('view');

    if (paymentStatus) {
        const savedOrderStr = sessionStorage.getItem('currentOrder');
        
        if (paymentStatus === 'success') {
            setAppState(AppState.Confirmation);
        } else if (paymentStatus === 'failure') {
            if (savedOrderStr) {
                try {
                    const savedOrder = JSON.parse(savedOrderStr);
                    setStudentName(savedOrder.studentName || '');
                    setCart(savedOrder.cart || []);
                } catch (e) {
                    console.error("Failed to parse saved order from sessionStorage", e);
                }
            }
            setAppState(AppState.PaymentFailure);
        }
        
        sessionStorage.removeItem('currentOrder');
        // Clean up URL to avoid re-triggering on refresh
        window.history.replaceState({}, document.title, window.location.pathname);

    } else if (view === 'admin') {
        setAppState(AppState.AdminLogin);
        window.history.replaceState({}, document.title, window.location.pathname);
    }

  }, []); // Empty dependency array ensures this runs only once on initial load.

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
        newCart.splice(existingItemIndex, 1);
      } else {
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
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/create-payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName, cart, total }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `שגיאת שרת (${response.status})` }));
        throw new Error(errorData.message || 'התרחשה שגיאה בהכנת התשלום.');
      }
      
      const { orderId } = await response.json();
      if (!orderId) {
        throw new Error('לא התקבל מזהה הזמנה מהשרת.');
      }

      // Save state to sessionStorage before redirecting away from the app
      sessionStorage.setItem('currentOrder', JSON.stringify({ orderId, studentName, cart }));

      const { VITE_NEDARIM_MOSAD_ID, VITE_NEDARIM_API_VALID } = import.meta.env;
      if (!VITE_NEDARIM_MOSAD_ID || !VITE_NEDARIM_API_VALID) {
          throw new Error("פרטי הסליקה אינם מוגדרים באפליקציה.");
      }
      
      const baseUrl = window.location.origin;
      const params = new URLSearchParams({
        MosadId: VITE_NEDARIM_MOSAD_ID,
        ApiValid: VITE_NEDARIM_API_VALID,
        Amount: total.toString(),
        SaleId: orderId,
        Currency: '1', // Explicitly set currency to ILS (1)
        CallBackUrl: `${baseUrl}/api/payment-webhook`,
        PaymentSuccessRedirectUrl: `${baseUrl}/?payment=success`,
        PaymentFailedRedirectUrl: `${baseUrl}/?payment=failure`,
        // Re-adding FullName and SaleDesc, as they might be mandatory.
        // URLSearchParams handles encoding.
        FullName: studentName,
        SaleDesc: `רכישת ספרים עבור ${studentName}`,
        PayWhatYouWant: 'false',
      });

      // Reverting to the URL from the official documentation as a last attempt.
      const url = `https://www.matara.pro/nedarimplus/V6/DebitIframe.aspx?${params.toString()}`;
      
      // Redirect the user to the payment page
      window.location.href = url;

    } catch (error) {
       console.error("Payment initiation error:", error);
       const errorMessage = error instanceof Error ? error.message : 'שגיאת רשת או שהשרת אינו זמין.';
       setSubmitError(`יצירת התשלום נכשלה. נא לנסות שוב. (פרטי שגיאה: ${errorMessage})`);
       setIsSubmitting(false); // Stop submitting on pre-redirect error
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

      if (response.status === 401) throw new Error('סיסמה שגויה.');
      if (!response.ok) throw new Error('שגיאה בגישה לנתונים.');

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

  const resetOrderState = () => {
    setStudentName('');
    setCart([]);
    setSubmitError(null);
  };

  const handleStartNewOrder = () => {
    resetOrderState();
    setAppState(AppState.Welcome);
  };
  
  const handleTryAgain = () => {
    // User state (name, cart) is already restored from sessionStorage.
    // Just navigate back to the book selection screen.
    setSubmitError(null);
    setAppState(AppState.BookSelection);
  }

  const handleNavigateToAdminLogin = () => {
    resetOrderState();
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
              onBack={handleStartNewOrder}
              isProcessing={isSubmitting}
              error={submitError}
            />
        );
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
            onLogout={handleStartNewOrder}
          />
        );
      default:
        return <Welcome onNameSubmit={handleNameSubmit} />;
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
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
