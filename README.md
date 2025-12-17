# Sistema Digital de Papeletas - SDPS

Sistema de gestión de papeletas de salida para la Municipalidad Provincial de San Miguel.

## 📋 Descripción

Aplicación web desarrollada con React para gestionar las papeletas de salida del personal municipal, con módulos diferenciados para RRHH y Administradores.

## ✨ Mejoras Recientes (Refactorización)

### Arquitectura Modular
- **Configuración Centralizada**: Todos los constants y endpoints API en `src/config/`
- **Custom Hooks**: Lógica reutilizable en `src/hooks/`
- **Servicios Organizados**: Capa de servicios separada en `src/services/`
- **Componentes Modulares**: Componentes RRHH divididos en subcarpetas especializadas

### Estructura del Componente RRHH
Reducido de **1606 líneas** a **1069 líneas** (~33% de reducción) mediante:
- `FiltrosPapeletas`: Manejo de filtros (DNI, fecha, motivo)
- `TarjetasEstadisticas`: Cards de estadísticas en tiempo real
- `TablaPapeletas`: Listado de papeletas con estado de carga
- `Paginacion`: Control de navegación entre páginas
- `ModalDetallePapeleta`: Visualización detallada de papeletas

### Validación de Tipos
- PropTypes implementado en todos los componentes nuevos
- Validación de props con valores por defecto

## 🏗️ Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
