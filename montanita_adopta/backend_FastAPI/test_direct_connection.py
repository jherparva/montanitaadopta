import pymysql

# Conexión directa a MySQL sin usar SQLAlchemy
try:
    conn = pymysql.connect(
        host='localhost',
        user='root',
        password='',  # Deja vacío si no hay contraseña
        database='bdmontanitaadopta',
        port=3306
    )
    
    cursor = conn.cursor()
    
    # Listar tablas
    cursor.execute("SHOW TABLES")
    tables = cursor.fetchall()
    
    print("Tablas encontradas:")
    for table in tables:
        table_name = table[0]
        print(f" - {table_name}")
        
        # Intentar seleccionar datos de la tabla
        try:
            cursor.execute(f"SELECT * FROM `{table_name}` LIMIT 5")
            rows = cursor.fetchall()
            print(f"   * Filas encontradas: {len(rows)}")
        except Exception as e:
            print(f"   * Error al consultar tabla: {e}")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"Error de conexión: {e}")