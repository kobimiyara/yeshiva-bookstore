# לב ארי ספרים - חנות הספרים של ישיבת שבי חברון

זוהי אפליקציית רשת המאפשרת לתלמידי ישיבת שבי חברון להזמין ספרי לימוד בתחילת השנה. האפליקציה כוללת ממשק לבחירת ספרים, תהליך תשלום אוטומטי ומאובטח המבצע הפנייה (redirect) לעמוד הסליקה של "נדרים פלוס", ומערכת ניהול לצפייה וייצוא של ההזמנות.

הפרויקט בנוי עם React, TypeScript, ו-Vite בחלק הקדמי (Frontend), ומשתמש ב-Serverless Functions כדי לתקשר עם מסד נתונים של MongoDB ולקבל עדכונים (Webhooks) משירות הסליקה של "נדרים פלוס".

## הרצה מקומית (על המחשב שלך)

כדי להריץ את הפרויקט בסביבת פיתוח מקומית, ודא שהדרישות הבאות מותקנות במחשבך:
- [Node.js](https://nodejs.org/) (גרסה 18 ומעלה)
- [Git](https://git-scm.com/)

### שלב 1: שכפול הפרויקט

פתח טרמינל (Terminal או Command Prompt) והרץ את הפקודה הבאה כדי להוריד את קבצי הפרויקט למחשב שלך.
```bash
# החלף את ה-URL בכתובת המאגר שלך ב-GitHub
git clone https://github.com/your-username/your-repository-name.git

# היכנס לתיקיית הפרויקט שנוצרה
cd your-repository-name
```

### שלב 2: התקנת תלויות

הרץ את הפקודה הבאה כדי להתקין את כל החבילות שהפרויקט צריך כדי לרוץ:
```bash
npm install
```

### שלב 3: הגדרת משתני סביבה

צור קובץ חדש בתיקייה הראשית של הפרויקט בשם **`.env`**. קובץ זה ישמור את המידע הרגיש שלך ולא יועלה ל-GitHub (בהנחה שקובץ `.gitignore` קיים ומוגדר כראוי).

העתק את התוכן הבא לתוך קובץ ה-`.env` שיצרת, והחלף את הערכים בערכים האמיתיים שלך:

```
# =================================
# MongoDB Configuration
# =================================
# החלף במחרוזת החיבור שלך מ-MongoDB Atlas
MONGO_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/"
# החלף בשם מסד הנתונים שלך (לדוגמה: "yeshiva-orders")
MONGO_DB_NAME="yeshiva-orders"
# בחר סיסמה חזקה עבור כניסת מנהלים לצפייה בהזמנות
ADMIN_PASSWORD="MySuperSecretAdminPassword123"

# =================================
# Nedarim Plus Integration (for Frontend)
# =================================
# פרטי ההתממשקות שקיבלת מהתמיכה של "נדרים פלוס".
# התחילית "VITE_" הופכת אותם לזמינים בקוד בצד הלקוח לצורך בניית קישור ההפניה.
VITE_NEDARIM_MOSAD_ID="YOUR_MOSAD_ID_FROM_NEDARIM"
VITE_NEDARIM_API_VALID="YOUR_API_VALID_FROM_NEDARIM"
```
**נקודה קריטית:** ודא שהערכים של `VITE_NEDARIM_MOSAD_ID` ו-`VITE_NEDARIM_API_VALID` הם אלו שקיבלת מצוות התמיכה של "נדרים פלוס". שימוש בערכים שגויים יגרום לכשל בתהליך התשלום.

### שלב 4: הרצת שרת הפיתוח

כעת, הרץ את הפקודה הבאה כדי להפעיל את האפליקציה:

```bash
npm run dev
```

Vite יפעיל שרת פיתוח. פתח את הדפדפן וגלוש לכתובת המקומית שמופיעה בטרמינל (בדרך כלל `http://localhost:5173`).

---

## העלאה לאינטרנט (Deployment)

הדרך המומלצת להעלות את הפרויקט לאינטרנט היא באמצעות [Vercel](https://vercel.com/).

1.  ודא שכל הקוד שלך נמצא במאגר ב-GitHub.
2.  צור חשבון ב-Vercel והתחבר עם חשבון ה-GitHub שלך.
3.  ייבא את המאגר שלך ל-Vercel.
4.  בהגדרות הפרויקט ב-Vercel, תחת "Environment Variables", הוסף את **כל חמשת** המשתנים שהגדרת בקובץ ה-`.env` (שימו לב לשמות המדויקים).
5.  לחץ על `Deploy`. בסיום התהליך, תקבל קישור לאתר הפעיל שלך.