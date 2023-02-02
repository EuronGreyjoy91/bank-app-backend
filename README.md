# Bank App BACKEND
**Backend del proyecto - TP Final programacion 3 - 2023**

**Profesor**: Gaston Larriera  

## Descripcion del repositorio

* **Modulo config**: Contiene la configuracion para almacenar los logs en el archivo app.log.
* **Errors**: Contiene todos los errores disparados por el backend.
* **Middlewares**: Contiene un archivo encargado de generar los tokens para consumir el backend (JWT).
* **Models**: Contiene archivos que representan los datos almacenados en la BD.
* **Routes**: Contiene archivos con las rutas posibles a consumir.


El modulo utiliza **express** para todo lo que es la generacion de rutas para consumir informacion, **mongodb** y **mongoose** para almacenar informacion y **JWT** para la generacion de token y autenticacion / autorizacion de los endpoints.  
Los logs se almacenan en el archivo **app.log**


## Dependencias 🛠️
```
bcryptjs
cors
dotenv
express
express-validator
jsonwebtoken
log4js
mongoose
node-fetch
node-fetch-commonjs
random-spanish-words
```

## Como instalarlo
Para levantar el modulo, es necesario situarse en la carpeta donde se lo descargo y ejecutar los siguientes comandos:

```
npm install
```

```
npm run dev
```
Si todo sale bien, el modulo se levanta en http://localhost:4000

**NOTA - IMPORTANTE !!**  

Para lo que es la base de datos no es necesario levantar nada, ya que la misma esta alojada de forma online en mongodb Atlas.
**En caso de que la conexion no se pueda realizar porque la base de mongodb Atlas esta offline** (es un servidor gratuito), lo que habria que hacer es lo siguiente:

* En el archivo **database.js**, modificar la URI de conexion de base de datos por la que corresponda a la conexion **local**.

* Levantar el proyecto.

* En la base de datos que se genera al levantar el proyecto (bankApp), habria que popular ciertas colecciones para que el proyecto funcione ok. Estas son las colecciones y sus valores:

* AccountTypes:
```
{
    "description" : "Caja de ahorro"
    "code" : "CAJA_AHORRO",
    "offLimitAmount" : 0
}

{
    "description" : "Cuenta Corriente",
    "code" : "CUENTA_CORRIENTE",
    "offLimitAmount" : 5000
}
```
* ClientTypes
```
{
    "description" : "Persona Fisica",
    "code" : "PERSONA_FISICA"
}

{
    "description" : "Persona Juridica",
    "code" : "PERSONA_JURIDICA"
}
```
* MovementTypes
```
{
    "description" : "Deposito",
    "code" : "DEPOSIT"
}

{
    "description" : "Extraccion",
    "code" : "EXTRACTION"
}

{
    "description" : "Transferencia",
    "code" : "TRANSFER"
}
```
* UserTypes
```
{
    "description" : "Admin",
    "code" : "ADMIN"
}

{
    "description" : "Cliente",
    "code" : "CLIENT"
}
```

* Una vez realizado esto, lo unico que falta es dar de alta un usuario ADMIN para poder loguearnos, el siguiente CURL da de alta el usuario admin con la contraseña 12345

```
curl --location --request POST 'localhost:4000/api/v1/users' \
--header 'Content-Type: application/json' \
--data-raw '{
    "userName": "admin",
    "password": "12345",
    "userTypeCode": "ADMIN"
}'
```

## Autor

**Federico Ignacio Ibarra Berardi** - 

**Email**: federicoibarrab@gmail.com
