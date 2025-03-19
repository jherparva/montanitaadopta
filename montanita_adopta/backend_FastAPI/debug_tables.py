import pymysql

try:
    conn = pymysql.connect(
        host='localhost',
        user='root',
        password='',  # Deja vacío si no hay contraseña
        database='bdmontanitaadopta',
        port=3306
    )
    
    cursor = conn.cursor()
    
    # Verificar la base de datos actual
    cursor.execute("SELECT DATABASE()")
    current_db = cursor.fetchone()[0]
    print(f"Base de datos actual: {current_db}")
    
    # Listar todas las tablas con información detallada
    cursor.execute("SHOW FULL TABLES")
    tables = cursor.fetchall()
    
    print("\nTablas en la base de datos:")
    for table_info in tables:
        table_name = table_info[0]
        table_type = table_info[1]
        print(f" - {table_name} (Tipo: {table_type})")
        
        # Intentar seleccionar datos con comillas invertidas
        try:
            # Usar comillas invertidas para los nombres de tabla
            cursor.execute(f"SELECT * FROM `{table_name}` LIMIT 1")
            row = cursor.fetchone()
            if row:
                print(f"   * Consulta exitosa - Encontrada 1 fila")
            else:
                print(f"   * Consulta exitosa - Tabla vacía")
        except Exception as e:
            print(f"   * Error al consultar tabla: {e}")
            
            # Intentar consultar la estructura de la tabla
            try:
                cursor.execute(f"DESCRIBE `{table_name}`")
                columns = cursor.fetchall()
                print(f"   * Estructura de la tabla (columnas: {len(columns)})")
            except Exception as e2:
                print(f"   * Error al consultar estructura: {e2}")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"Error de conexión: {e}")