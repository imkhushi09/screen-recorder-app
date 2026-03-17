import os
from database import SessionLocal
from models import Recording

def cleanup_orphaned_files():
    """Remove files from uploads folder that aren't in the database"""
    db = SessionLocal()
    
    try:
        # Get all filenames from database
        db_records = db.query(Recording).all()
        db_files = {r.filename for r in db_records}
        
        # Get all files in uploads directory
        upload_files = set(f for f in os.listdir('uploads') if f.endswith('.webm'))
        
        # Find orphaned files (in uploads but not in DB)
        orphaned_files = upload_files - db_files
        
        print(f"Files in database: {len(db_files)}")
        print(f"Files in uploads folder: {len(upload_files)}")
        print(f"Orphaned files: {len(orphaned_files)}")
        
        if orphaned_files:
            print("\nOrphaned files to remove:")
            for filename in orphaned_files:
                file_path = os.path.join('uploads', filename)
                if os.path.exists(file_path):
                    os.remove(file_path)
                    print(f"  Removed: {filename}")
        
        print("\nCleanup completed!")
        
    except Exception as e:
        print(f"Error during cleanup: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    cleanup_orphaned_files()
