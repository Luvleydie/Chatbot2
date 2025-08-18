# Documento de Plantillas para Meta WhatsApp - Entrevista a Conductores

## 1. Objetivo
Diseñar las plantillas necesarias para conectar un chatbot de entrevista para choferes de Uber o Didi vía WhatsApp con Meta. El bot evalúa si un candidato cumple con los requisitos para rentar un automóvil.

## 2. Plantillas a registrar en Meta (WhatsApp Business)

### entrevista_inicio
- **Tipo:** Botones
- **Encabezado:** Proceso de selección de conductores
- **Cuerpo:** Para comenzar, indícanos tu rango de edad
- **Botones:**
  - 18-23
  - 24-30
  - 31 o más

### fin_menor_edad
- **Tipo:** Texto
- **Encabezado:** No cumples los requisitos
- **Cuerpo:** Lo sentimos, debes tener al menos 24 años para continuar.

### pregunta_vivienda
- **Tipo:** Botones
- **Encabezado:** Información de vivienda
- **Cuerpo:** ¿Vivienda propia o prestada?
- **Botones:**
  - Vivienda propia
  - Vivienda prestada

### pregunta_cochera
- **Tipo:** Botones
- **Encabezado:** Seguridad del vehículo
- **Cuerpo:** ¿Cuenta con cochera cerrada?
- **Botones:**
  - Tengo cochera
  - No tengo cochera

### fin_sin_cochera
- **Tipo:** Texto
- **Cuerpo:** Lo sentimos, es necesario contar con cochera cerrada.

### pregunta_dependientes
- **Tipo:** Botones
- **Encabezado:** Información familiar
- **Cuerpo:** ¿Cuántos dependientes tiene?
- **Botones:**
  - Ninguno
  - 1-2
  - 3 o más

### fin_muchos_dependientes
- **Tipo:** Texto
- **Cuerpo:** Lo sentimos, excede el número permitido de dependientes.

### pregunta_recibo
- **Tipo:** Botones
- **Encabezado:** Documentación
- **Cuerpo:** ¿Cuenta con recibo predial a su nombre?
- **Botones:**
  - Sí, tengo recibo
  - No, no tengo recibo

### fin_sin_recibo
- **Tipo:** Texto
- **Cuerpo:** Lo sentimos, es indispensable tener un recibo predial a su nombre.

### pregunta_experiencia
- **Tipo:** Botones
- **Encabezado:** Experiencia previa
- **Cuerpo:** ¿Ha rentado auto antes?
- **Botones:**
  - He rentado antes
  - Nunca he rentado

### mensaje_final
- **Tipo:** Texto
- **Encabezado:** ¡Felicidades!
- **Cuerpo:** Eres apto para una reunión presencial mañana a las 7:00 PM en Venecia 607, cerca del CBTis 110. Aquí puedes ver la ubicación: https://maps.app.goo.gl/TEHcTAbzW2U9ucpQ6

## 3. Flujo Conversacional Base
1. Usuario envía un saludo.
2. Bot responde con **entrevista_inicio**.
3. Según la opción seleccionada:
   - "18-23" → **fin_menor_edad**.
   - "24-30" o "31 o más" → **pregunta_vivienda**.
4. Respuesta a **pregunta_vivienda** → **pregunta_cochera**.
5. "No tengo cochera" → **fin_sin_cochera**.
6. "Tengo cochera" → **pregunta_dependientes**.
7. "3 o más" → **fin_muchos_dependientes**.
8. "Ninguno" o "1-2" → **pregunta_recibo**.
9. "No, no tengo recibo" → **fin_sin_recibo**.
10. "Sí, tengo recibo" → **pregunta_experiencia**.
11. Cualquier opción en **pregunta_experiencia** → **mensaje_final**.

## 4. Estructura de API y BD (MySQL + PHP)

### Endpoints

#### POST /api/candidato
Registra las respuestas del candidato.

```
{
  "telefono": "+521234567890",
  "edad": "24-30",
  "vivienda": "Vivienda propia",
  "cochera": true,
  "dependientes": "1-2",
  "recibo_predial": true,
  "rento_antes": false
}
```

#### GET /api/candidato/{telefono}
Devuelve la información almacenada del candidato.

### Estructura mínima en MySQL

```
CREATE TABLE candidatos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  telefono VARCHAR(20) UNIQUE,
  edad VARCHAR(10),
  vivienda VARCHAR(20),
  cochera BOOLEAN,
  dependientes VARCHAR(10),
  recibo_predial BOOLEAN,
  rento_antes BOOLEAN,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Scripts PHP (resumen)

`/api/candidato.php`
- `POST`: inserta o actualiza la información del candidato.
- `GET`: recupera los datos almacenados.

### Conexión desde Node.js

El proyecto expone los mismos endpoints en `src/app.ts` utilizando MySQL.

1. Configura las variables de entorno para tu base de datos creada en XAMPP:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=chatbot
```

2. Inicia el servidor con `npm run dev` y prueba las rutas en Postman:

- **POST** `http://localhost:3009/api/candidato`
- **GET** `http://localhost:3009/api/candidato/{telefono}`

