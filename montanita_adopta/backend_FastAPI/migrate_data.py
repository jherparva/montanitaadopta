from sqlalchemy import create_engine, text
import pandas as pd

# Conexión a tu base de datos MySQL local
mysql_engine = create_engine('mysql+pymysql://root@localhost:3306/bdmontanitaadopta')

# Conexión a tu base de datos PostgreSQL en Render
pg_url = "postgresql://bdmontanitaadopta_user:BNYCV64cujn9qohDJk8kQkHDmQY3teE0@dpg-cvcfgtjtq21c739uf2lg-a.oregon-postgres.render.com/bdmontanitaadopta"
pg_engine = create_engine(pg_url)

# Lista de tablas a migrar
tables = ['usuarios', 'mascotas', 'adopciones', 'contacto', 'success_stories']

def migrate_table(table_name):
    print(f"Migrando datos de {table_name}...")
    
    # Leer datos de MySQL
    query = f"SELECT * FROM {table_name}"
    try:
        df = pd.read_sql_query(query, mysql_engine)
        print(f"  - Encontrados {len(df)} registros para migrar")
        
        if len(df) > 0:
            # Escribir datos a PostgreSQL
            df.to_sql(table_name, pg_engine, if_exists='append', index=False)
            print(f"  - {len(df)} registros migrados exitosamente")
        else:
            print(f"  - No hay datos para migrar en {table_name}")
            
    except Exception as e:
        print(f"  - Error al migrar {table_name}: {e}")

# Ejecutar la migración
if __name__ == "__main__":
    try:
        for table in tables:
            migrate_table(table)
        print("Migración completada con éxito")
    except Exception as e:
        print(f"Error general durante la migración: {e}")