from sqlalchemy.orm import Session
from app.models.mascotas import Mascota
from app.core.db import SessionLocal, Base, engine
from sqlalchemy.exc import SQLAlchemyError

# Crear una sesión de base de datos
db: Session = SessionLocal()

def reset_and_populate():
    try:
        print("🔄 Iniciando proceso de reinicio y repoblación de la base de datos")
        
        # 1. Eliminar todas las mascotas actuales
        try:
            count = db.query(Mascota).delete()
            db.commit()
            print(f"🗑️ Se eliminaron {count} mascotas de la base de datos")
        except SQLAlchemyError as e:
            db.rollback()
            print(f"❌ Error al eliminar mascotas: {str(e)}")
            return False
        
        # 2. Lista de mascotas para repoblar
        mascotas = [
            # Perros - Cachorros (puppy)
            Mascota(nombre="Luna", especie="dog", edad="puppy", tamaño="small", raza="labrador", sexo="hembra", descripcion="Una perrita juguetona y amigable.", imagen="luna.jpg", disponible=True),
            Mascota(nombre="Bella", especie="dog", edad="puppy", tamaño="medium", raza="beagle", sexo="hembra", descripcion="Cachorra curiosa y llena de energía.", imagen="bella.jpg", disponible=True),
            Mascota(nombre="Toby", especie="dog", edad="puppy", tamaño="large", raza="golden retriever", sexo="macho", descripcion="Cachorro tierno y juguetón.", imagen="toby.jpg", disponible=True),
            Mascota(nombre="Simón", especie="dog", edad="puppy", tamaño="medium", raza="border collie", sexo="macho", descripcion="Un perrito muy inteligente.", imagen="simon.jpg", disponible=True),
            Mascota(nombre="Rex", especie="dog", edad="puppy", tamaño="large", raza="german shepherd", sexo="macho", descripcion="Cachorro fuerte y protector.", imagen="rex.jpg", disponible=True),

            # Perros - Adultos (adult)
            Mascota(nombre="Max", especie="dog", edad="adult", tamaño="large", raza="golden retriever", sexo="macho", descripcion="Un perro leal y cariñoso.", imagen="max.jpg", disponible=True),
            Mascota(nombre="Thor", especie="dog", edad="adult", tamaño="large", raza="german shepherd", sexo="macho", descripcion="Perro protector y fiel.", imagen="thor.jpg", disponible=True),
            Mascota(nombre="Duke", especie="dog", edad="adult", tamaño="medium", raza="husky", sexo="macho", descripcion="Perro enérgico y resistente.", imagen="duke.jpg", disponible=True),
            Mascota(nombre="Bobby", especie="dog", edad="adult", tamaño="small", raza="poodle", sexo="macho", descripcion="Pequeño pero lleno de amor.", imagen="bobby.jpg", disponible=True),
            Mascota(nombre="Rocky", especie="dog", edad="adult", tamaño="medium", raza="bulldog", sexo="macho", descripcion="Fuerte pero cariñoso.", imagen="rocky.jpg", disponible=True),

            # Perros - Senior
            Mascota(nombre="Charlie", especie="dog", edad="senior", tamaño="medium", raza="cocker spaniel", sexo="macho", descripcion="Tranquilo y amoroso.", imagen="charlie.jpg", disponible=True),
            Mascota(nombre="Bruno", especie="dog", edad="senior", tamaño="large", raza="doberman", sexo="macho", descripcion="Un perro fiel en sus últimos años.", imagen="bruno.jpg", disponible=True),
            Mascota(nombre="Oscar", especie="dog", edad="senior", tamaño="medium", raza="shih tzu", sexo="macho", descripcion="Un abuelo con mucha ternura.", imagen="oscar.jpg", disponible=True),
            Mascota(nombre="Tobys", especie="dog", edad="senior", tamaño="small", raza="chihuahua", sexo="macho", descripcion="Pequeño pero lleno de vida.", imagen="toby_senior.jpg", disponible=True),
            Mascota(nombre="Loki", especie="dog", edad="senior", tamaño="large", raza="great dane", sexo="macho", descripcion="Viejo pero majestuoso.", imagen="loki.jpg", disponible=True),

            # Gatos - Bebés (kitten)
            Mascota(nombre="Milo", especie="cat", edad="kitten", tamaño="small", raza="siamese", sexo="macho", descripcion="Gatito curioso y activo.", imagen="milo.jpg", disponible=True),
            Mascota(nombre="Cleo", especie="cat", edad="kitten", tamaño="small", raza="bengal", sexo="hembra", descripcion="Gatita juguetona con un hermoso pelaje.", imagen="cleo.jpg", disponible=True),
            Mascota(nombre="Leo", especie="cat", edad="kitten", tamaño="medium", raza="maine coon", sexo="macho", descripcion="Gatito peludo y travieso.", imagen="leo.jpg", disponible=True),
            Mascota(nombre="Chloe", especie="cat", edad="kitten", tamaño="small", raza="persian", sexo="hembra", descripcion="Gatita elegante y suave.", imagen="chloe.jpg", disponible=True),
            Mascota(nombre="Simba", especie="cat", edad="kitten", tamaño="medium", raza="ragdoll", sexo="macho", descripcion="Gatito tranquilo y amoroso.", imagen="simba_kitten.jpg", disponible=True),

            # Gatos - Adultos (adult)
            Mascota(nombre="Nala", especie="cat", edad="adult", tamaño="medium", raza="persian", sexo="hembra", descripcion="Gata tranquila y amorosa.", imagen="nala.jpg", disponible=True),
            Mascota(nombre="Garfield", especie="cat", edad="adult", tamaño="large", raza="british shorthair", sexo="macho", descripcion="Gato relajado y dormilón.", imagen="garfield.jpg", disponible=True),
            Mascota(nombre="Misty", especie="cat", edad="adult", tamaño="small", raza="burmese", sexo="hembra", descripcion="Gata cariñosa y leal.", imagen="misty.jpg", disponible=True),
            Mascota(nombre="Whiskers", especie="cat", edad="adult", tamaño="medium", raza="siberian", sexo="macho", descripcion="Gato fuerte y ágil.", imagen="whiskers.jpg", disponible=True),
            Mascota(nombre="Tasha", especie="cat", edad="adult", tamaño="large", raza="norwegian forest", sexo="hembra", descripcion="Gata majestuosa y peluda.", imagen="tasha.jpg", disponible=True),

            # Gatos - Senior
            Mascota(nombre="Simbad", especie="cat", edad="senior", tamaño="medium", raza="maine coon", sexo="macho", descripcion="Gato grande y majestuoso.", imagen="simba_senior.jpg", disponible=True),
            Mascota(nombre="Oliver", especie="cat", edad="senior", tamaño="small", raza="scottish fold", sexo="macho", descripcion="Gato con orejas adorables.", imagen="oliver.jpg", disponible=True),
            Mascota(nombre="Felix", especie="cat", edad="senior", tamaño="medium", raza="american shorthair", sexo="macho", descripcion="Gato simpático y relajado.", imagen="felix.jpg", disponible=True),
            Mascota(nombre="Tom", especie="cat", edad="senior", tamaño="large", raza="turkish angora", sexo="macho", descripcion="Gato blanco y elegante.", imagen="tom.jpg", disponible=True),
            Mascota(nombre="Lunatica", especie="cat", edad="senior", tamaño="small", raza="devon rex", sexo="hembra", descripcion="Gata anciana pero juguetona.", imagen="luna_senior.jpg", disponible=True),
        ]
        
        # 3. Insertar en lotes de 5 mascotas cada vez
        success_count = 0
        
        for i in range(0, len(mascotas), 5):
            lote = mascotas[i:i+5]
            try:
                db.add_all(lote)
                db.commit()
                success_count += len(lote)
                print(f"✅ Lote {i//5 + 1} agregado correctamente ({len(lote)} mascotas)")
            except SQLAlchemyError as e:
                db.rollback()
                print(f"❌ Error al agregar lote {i//5 + 1}: {str(e)}")
                # Intentar uno por uno
                for mascota in lote:
                    try:
                        db.add(mascota)
                        db.commit()
                        success_count += 1
                        print(f"  ✅ Mascota '{mascota.nombre}' agregada individualmente")
                    except SQLAlchemyError as e2:
                        db.rollback()
                        print(f"  ❌ Error al agregar mascota '{mascota.nombre}': {str(e2)}")
        
        # 4. Verificar el resultado
        total = db.query(Mascota).count()
        print(f"\n✅ Proceso completado. Se agregaron {success_count} de {len(mascotas)} mascotas.")
        print(f"📊 Total de mascotas en la base de datos: {total}")
        
        return True
    
    except Exception as e:
        print(f"❌ Error general: {str(e)}")
        return False
    
    finally:
        db.close()

# Ejecutar la función
reset_and_populate()