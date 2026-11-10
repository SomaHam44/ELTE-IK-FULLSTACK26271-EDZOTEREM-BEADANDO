„A Peak Form egy edzőtermi csoportok és edzések kezelésére tervezett webalkalmazás. A frontend Angularban és TypeScriptben készül; önálló komponenseket és jelalapú állapotkezelést használ. A backend Laravel és PHP alapú, jelenleg SQLite adatbázissal.
A frontend és a backend HTTP-n keresztül, JSON-adatokkal kommunikál. Bejelentkezéskor az Angular először lekéri a CSRF-védelmi sütit, majd elküldi a belépési adatokat a Laravelnek. Sikeres belépés után lekéri a bejelentkezett felhasználó adatait. A munkamenetet a Laravel kezeli, a Sanctum és Fortify csomagok segítségével. Fejlesztés közben az Angular proxyja továbbítja a backendnek az API- és bejelentkezési kéréseket.
Jelenleg a valódi Laravel-kapcsolat a bejelentkezésnél, kijelentkezésnél és a felhasználói adatok lekérésénél működik. Az edzés- és csoportkezelő felületek még helyi mintaadatokkal működnek; ezek backend API-ra kötése a következő fejlesztési lépés.”

A technológiák röviden:
- Frontend: Angular 22, TypeScript, Angular Router, HttpClient
- Backend: Laravel 13, PHP 8.4, Fortify és Sanctum
- Adatbázis: jelenleg SQLite
- Kapcsolat: HTTP-kérések és JSON-válaszok; fejlesztés közben Angular proxy
- Valós backend funkció most: bejelentkezés, kijelentkezés, bejelentkezett felhasználó lekérése
- Mintaadatokkal működő részek: csoport- és edzésfelületek