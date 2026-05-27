# Google Maps API Key — Restricción de dominio

La API key `AIzaSyAbFRPudnZ8IXs4e5C07IJW4bDmCoy-AE8` está expuesta en el HTML de las páginas:

- `/solucionesfotovoltaicas/` (calculadora)
- `/energia-renovables/` (calculadora)

## Para restringirla (seguridad)

1. Ir a https://console.cloud.google.com/apis/credentials
2. Seleccionar la key `AIzaSyAbFRPudnZ8IXs4e5C07IJW4bDmCoy-AE8`
3. En **Restricciones de aplicación → Sitios web**, agregar:
   - `*.simenergy.com.ve/*`
   - `simenergy.com.ve/*`
4. En **Restricciones de API**, seleccionar solo:
   - Maps JavaScript API
   - Places API
   - Drawing API
   - Geometry API
5. Guardar

> ⚠️ Sin esta restricción, cualquiera puede usar la key y generar costos a tu cuenta.
