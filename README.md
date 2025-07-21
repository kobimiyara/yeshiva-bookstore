# לב ארי ספרים - חנות הספרים של ישיבת שבי חברון

זוהי אפליקציית רשת המאפשרת לתלמידי ישיבת שבי חברון להזמין ספרי לימוד בתחילת השנה. האפליקציה כוללת ממשק לבחירת ספרים, תהליך תשלום אוטומטי ומאובטח באמצעות סליקת אשראי, ומערכת ניהול לצפייה וייצוא של ההזמנות.

הפרויקט בנוי עם React, TypeScript, ו-Vite בחלק הקדמי (Frontend), ומשתמש ב-Serverless Functions כדי לתקשר עם מסד נתונים של MongoDB ועם שירות הסליקה של "נדרים פלוס" בחלק האחורי (Backend).

## הרצה מקומית (על המחשב שלך)

בצע את השלבים הבאים כדי להריץ את הפרויקט בסביבת פיתוח מקומית.

### דרישות קדם

- [Node.js](https://nodejs.org/) (גרסה 18 ומעלה)
- [Git](https://git-scm.com/)
- חשבון [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (השכבה החינמית מספיקה)
- פרטי API מחברת הסליקה "נדרים פלוס"
- חשבון [GitHub](https://github.com/)

---

### שלב 1: הקמת מאגר קוד ב-GitHub

לפני שניתן "לשכפל" את הפרויקט, הקוד שלו צריך להיות מאוחסן במאגר (Repository) אינטרנטי. GitHub הוא המקום המומלץ לכך.

1.  **צור מאגר חדש ב-GitHub:** היכנס לחשבון ה-GitHub שלך, לחץ על "+" ובחר "New repository".
2.  **העלה את קבצי הפרויקט:** לאחר יצירת המאגר, בחר באפשרות "uploading an existing file" והעלה את כל הקבצים והתיקיות של הפרויקט.
3.  **העתק את כתובת ה-URL של המאגר:** לאחר שהקבצים עלו, העתק את כתובת ה-URL של המאגר מדפדפן האינטרנט. היא תיראה כך: `https://github.com/your-username/your-repository-name.git`.

### שלב 2: שכפול הפרויקט למחשב

פתח טרמינל (Terminal או Command Prompt) במחשב שלך, נווט לתיקייה בה תרצה לשמור את הפרויקט, והרץ את הפקודות הבאות:

```bash
# החלף את ה-URL בכתובת שהעתקת מ-GitHub
git clone https://github.com/your-username/your-repository-name.git

# היכנס לתיקיית הפרויקט שנוצרה
cd your-repository-name
```

### שלב 3: הגדרת קובץ `.gitignore`

זהו שלב קריטי לאבטחה וניהול נכון של הקוד. קובץ ה-`.gitignore` אומר למערכת Git מאילו קבצים להתעלם, כך שהם לא יעלו ל-GitHub.

1.  בתיקייה הראשית של הפרויקט, צור קובץ חדש בשם **`.gitignore`** (עם נקודה בהתחלה).
2.  העתק והדבק את התוכן הבא לתוך הקובץ שיצרת:

    ```gitignore
    # Dependencies
    /node_modules

    # Build output
    /dist

    # Environment variables - DO NOT COMMIT
    .env
    .env.local
    .env.*.local

    # Logs
    npm-debug.log*
    yarn-debug.log*
    yarn-error.log*

    # Editor directories and files
    .idea
    .vscode
    *.suo
    *.ntvs*
    *.njsproj
    *.sln
    *.sw?
    ```
**הסבר:** קובץ זה מונע העלאה של תיקיית `node_modules` הענקית, קבצי מערכת, וחשוב מכל - קובץ ה-`.env` שיכיל את הסיסמאות ופרטי ההתחברות.

### שלב 4: התקנת תלויות

הרץ את הפקודה הבאה בטרמינל כדי להתקין את כל החבילות שהפרויקט צריך כדי לרוץ:

```bash
npm install
```

### שלב 5: הגדרת משתני סביבה

צור קובץ חדש בתיקייה הראשית של הפרויקט בשם **`.env`**. קובץ זה ישמור את המידע הרגיש שלך.

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
# Nedarim Plus Payment Gateway
# =================================
# פרטי API שקיבלת מ"נדרים פלוס"
NEDARIM_API_NAME="YOUR_API_USERNAME"
NEDARIM_API_PASSWORD="YOUR_API_PASSWORD"
```

### שלב 6: הרצת שרת הפיתוח

כעת, הרץ את הפקודה הבאה כדי להפעיל את האפליקציה:

```bash
npm run dev
```

Vite יפעיל שרת פיתוח. פתח את הדפדפן וגלוש לכתובת המקומית שמופיעה בטרמינל (בדרך כלל `http://localhost:5173`).

האתר אמור להיות פעיל ולאפשר לך לבצע הזמנות שייסלקו אוטומטית דרך "נדרים פלוס".

---

## העלאה לאינטרנט (Deployment)

הדרך המומלצת להעלות את הפרויקט לאינטרנט היא באמצעות [Vercel](https://vercel.com/), שמציע תמיכה מצוינת בפרויקטי Vite עם Serverless Functions.

1.  ודא שכל הקוד שלך נמצא במאגר ב-GitHub.
2.  צור חשבון ב-Vercel והתחבר עם חשבון ה-GitHub שלך.
3.  ייבא את המאגר שלך ל-Vercel.
4.  Vercel יזהה אוטומטית שזהו פרויקט Vite.
5.  בהגדרות הפרויקט ב-Vercel, תחת "Environment Variables", הוסף את כל חמשת המשתנים שהגדרת בקובץ ה-`.env`:
    - `MONGO_URI`
    - `MONGO_DB_NAME`
    - `ADMIN_PASSWORD`
    - `NEDARIM_API_NAME`
    - `NEDARIM_API_PASSWORD`
6.  לחץ על `Deploy`. בסיום התהליך, תקבל קישור לאתר הפעיל שלך.