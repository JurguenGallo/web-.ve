# Plan de Migración - SIM Energy (.co → .co + .ve)

## Resumen
Duplicar la página **simenergy.com.co** a **simenergy.com.ve** usando **Truobox VPS Pro S**. Ambas versiones funcionarán simultáneamente.

## 1. Contratación - Truobox VPS Pro S

| Recurso | Especificación |
|---|---|
| RAM | 4 GB |
| vCPU | 2 x 2.6 GHz |
| Disco | 60 GB NVMe |
| Tráfico | Ilimitado |
| IPv4 | 1 Dedicada |
| Panel | Propietario Truobox |
| Soporte | Español |
| Precio | Bs. 2.626,27/mes (plan 3 años) |

**Pasos:**
1. Ir a [truobox.com](https://truobox.com) → VPS → Plan "Pro S"
2. Elegir: sistema operativo **Ubuntu 22.04 LTS**
3. Elegir: panel de control **cPanel** o **CyberPanel** (recomiendo CyberPanel - OpenLiteSpeed, más rápido y gratuito para WordPress)
4. Pagar y esperar credenciales de acceso (IP, usuario root, contraseña)

## 2. Configuración del Servidor VPS (cuando tengas acceso)

### 2.1 Acceso SSH
```bash
ssh root@<IP-DEL-VPS>
```

### 2.2 Instalar stack LAMP/LEMP
Si elegiste VPS sin panel, instalar lo necesario:

```bash
# Actualizar sistema
apt update && apt upgrade -y

# Instalar Apache/Nginx, MySQL, PHP 8.x
apt install apache2 mysql-server php8.1 php8.1-mysql \
  php8.1-curl php8.1-gd php8.1-mbstring php8.1-xml \
  php8.1-zip libapache2-mod-php8.1 -y

# Instalar WordPress
cd /var/www/html
wget https://wordpress.org/latest.tar.gz
tar -xzf latest.tar.gz
```

### 2.3 Instalar CyberPanel (recomendado - OpenLiteSpeed)
```bash
sh <(curl https://cyberpanel.net/install.sh || wget -O installer.sh https://cyberpanel.net/install.sh && sh installer.sh)
```
Seleccionar: **OpenLiteSpeed** + **PowerDNS** + **Postfix** + **Pure-FTPD**

### 2.4 Crear sitio en el panel
- Crear website: `simenergy.com.ve`
- Crear base de datos MySQL para WordPress
- Asignar PHP 8.x

## 3. Migración de WordPress

### 3.1 Exportar desde el sitio actual (.co)

**Opción A - Con plugins (más fácil):**
- Instalar **All-in-One WP Migration** o **Duplicator** en simenergy.com.co
- Exportar el sitio completo (archivos + BD)
- Descargar el archivo .wpress o .zip

**Opción B - Manual (más control):**
1. **Exportar BD:**
   - Ir a phpMyAdmin o usar WP Admin → Tools → Export
   - O via terminal:
   ```bash
   mysqldump -u usuario -p basededatos > simenergy_backup.sql
   ```

2. **Descargar archivos por FTP/SFTP:**
   - Todo `wp-content/` (uploads, themes, plugins)
   - `wp-config.php`

### 3.2 Importar al VPS (.ve)

**Con All-in-One WP Migration:**
1. Instalar mismo plugin en la instalación limpia de WP en .ve
2. Ir a Importar → seleccionar archivo → esperar
3. El plugin reemplaza todo automáticamente

**Manual:**
1. Subir archivos:
   ```bash
   rsync -avz wp-content/ root@<IP>:/var/www/simenergy.com.ve/wp-content/
   ```
2. Importar BD:
   ```bash
   mysql -u usuario -p basedatos < simenergy_backup.sql
   ```
3. Editar `wp-config.php` con credenciales de la nueva BD

### 3.3 Reemplazar URLs en la BD

Correr en la nueva base de datos para cambiar todas las URLs:

```sql
UPDATE wp_options SET option_value = 'https://simenergy.com.ve' WHERE option_name = 'siteurl';
UPDATE wp_options SET option_value = 'https://simenergy.com.ve' WHERE option_name = 'home';
UPDATE wp_posts SET post_content = REPLACE(post_content, 'https://simenergy.com.co', 'https://simenergy.com.ve');
UPDATE wp_posts SET guid = REPLACE(guid, 'https://simenergy.com.co', 'https://simenergy.com.ve');
UPDATE wp_postmeta SET meta_value = REPLACE(meta_value, 'https://simenergy.com.co', 'https://simenergy.com.ve');
```

**O usar plugin: Better Search Replace** (más seguro).

## 4. Mantener .co funcionando

**El sitio .co original NO se toca.** Sigue funcionando con su hosting actual.

Ambos sitios son independientes:
- `simenergy.com.co` → hosting actual (intacto)
- `simenergy.com.ve` → VPS Truobox (duplicado)

Para mantener contenido sincronizado, hay dos opciones:
- **Opción A (recomendada):** Actualizar manualmente ambos cuando haya cambios
- **Opción B:** Usar plugin **WPvivid Backup** o **MainWP** para sincronización

## 5. Lista de tareas pendientes para cuando recibas acceso

- [ ] Contratar Truobox VPS Pro S
- [ ] Recibir credenciales del VPS (IP, usuario, contraseña)
- [ ] Configurar servidor + panel
- [ ] Recibir acceso al WordPress actual (.co - admin/FTP)
- [ ] Exportar WordPress desde .co
- [ ] Importar WordPress al VPS .ve
- [ ] Configurar dominio .ve en el panel DNS
- [ ] Reemplazar URLs en la BD
- [ ] Probar que .ve funciona correctamente
- [ ] Probar que .co sigue funcionando

## 6. Notas importantes

- **Divi** es un tema premium - necesitarás la licencia para activarlo en el .ve (si usas la misma, puede funcionar en ambos)
- **Nextend Smart Slider Pro** igual requiere licencia
- **Yoast SEO Premium** - necesitarás licencia separada o cambiar a Yoast free
- Los formularios de contacto (si hay) pueden necesitar reconfiguración
- Los certificados SSL los puedes obtener gratis con **Let's Encrypt** (CyberPanel lo maneja automático)
