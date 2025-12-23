# Programación de Producción - Planta Telas No Tejidas

Aplicación frontend para la programación de producción en una planta de telas no tejidas (Non-Woven Fabrics). Esta aplicación proporciona una vista tipo calendario similar a Microsoft Outlook/Google Calendar para visualizar y gestionar la programación de producción de múltiples máquinas.

## Características

- **Vista Diaria**: Visualiza hasta 7 máquinas simultáneamente en un día
- **Vista Individual**: Visualiza una máquina específica durante 7 días
- **Bloques de Producción**: Muestra bloques de producción (azul) y ajustes/mantenimiento (gris)
- **Modal de Detalles**: Click en cualquier bloque para ver información detallada
- **Navegación de Fechas**: Navega entre días/semanas con botones de navegación
- **Filtro de Máquinas**: Selecciona qué máquinas visualizar en la vista diaria
- **Indicador de Hora Actual**: Línea roja que indica la hora actual en tiempo real

## Stack Tecnológico

- **React 18** con **Vite**
- **Tailwind CSS** para estilos
- **Lucide React** para iconografía
- **date-fns** para manejo de fechas

## Instalación

1. Instala las dependencias:
```bash
npm install
```

2. Inicia el servidor de desarrollo:
```bash
npm run dev
```

3. Abre tu navegador en `http://localhost:5173`

## Estructura del Proyecto

```
src/
├── components/
│   ├── Layout.jsx              # Componente principal que orquesta la aplicación
│   ├── CalendarHeader.jsx      # Header con navegación y filtros
│   ├── MachineColumn.jsx       # Columna para una máquina (vista diaria)
│   ├── DayColumn.jsx           # Columna para un día (vista individual)
│   ├── ProductionBlock.jsx     # Bloque individual de producción/ajuste
│   └── DetailsModal.jsx        # Modal con detalles del bloque seleccionado
├── hooks/
│   └── useProductionData.js    # Hook para obtener datos de producción
├── utils/
│   ├── constants.js            # Constantes de la aplicación
│   └── mockData.js             # Generador de datos mock
├── App.jsx
├── main.jsx
└── index.css
```

## Preparación para Backend

La aplicación está preparada para conectarse a un backend. Las funciones de fetch están definidas en `src/hooks/useProductionData.js`:

- `fetchProductionData(date, machineId)`: Obtiene datos de producción para una fecha específica
- `API_BASE_URL`: Constante definida en `src/utils/constants.js` (actualmente: `http://localhost:8000`)

Para conectar con el backend, simplemente descomenta la llamada a `fetchProductionData` en el hook `useProductionData` y ajusta la URL base según sea necesario.

## Formato de Datos

Cada bloque de programación tiene la siguiente estructura:

```javascript
{
  id: string,                    // ID único del bloque
  machineId: string,              // ID de la máquina (Machine 1, Machine 2, etc.)
  type: 'PRODUCTION' | 'ADJUSTMENT',
  startTime: ISO DateTime,       // Fecha/hora de inicio
  endTime: ISO DateTime,         // Fecha/hora de fin
  productName?: string,           // Solo si type === 'PRODUCTION'
  quantity?: number,              // Solo si type === 'PRODUCTION'
  description?: string           // Solo si type === 'ADJUSTMENT'
}
```

## Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm run preview`: Previsualiza la build de producción
- `npm run lint`: Ejecuta el linter

## Notas

- La programación es continua (100% de ocupación): el `endTime` de un bloque es exactamente el `startTime` del siguiente
- Los bloques de producción se muestran en azul, los ajustes en gris
- El scroll vertical está sincronizado entre la columna de tiempo y las columnas de máquinas/días
- La aplicación es responsive y ocupa el 100% de la altura de la pantalla
