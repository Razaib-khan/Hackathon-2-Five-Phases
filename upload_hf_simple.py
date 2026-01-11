#!/usr/bin/env python3
import os
from huggingface_hub import HfApi
import tempfile

def upload_core_files():
    # Initialize the API client
    api = HfApi()

    # Source directory with our prepared files
    source_dir = "/mnt/d/Hackathon 2 FIve Phases/hf-space-clean"

    # Define the key files to upload (avoiding cache files)
    key_files = [
        "README.md",
        "Dockerfile",
        "app/requirements.txt",
        "app/docker-entrypoint.sh",
        "app/src/main.py",
        "app/src/api/auth.py",
        "app/src/api/tasks.py",
        "app/src/db/session.py",
        "app/src/models/user.py",
        "app/src/models/task.py",
        "app/src/config.py",
    ]

    print(f"Uploading {len(key_files)} key files...")

    # Upload each key file to the space
    for file_path in key_files:
        local_path = os.path.join(source_dir, file_path)
        if os.path.exists(local_path):
            print(f"Uploading {file_path}...")
            try:
                api.upload_file(
                    path_or_fileobj=local_path,
                    path_in_repo=file_path,
                    repo_id="Razaib123/aido-todo-api",
                    repo_type="space"
                )
                print(f"✓ Successfully uploaded {file_path}")
            except Exception as e:
                print(f"✗ Failed to upload {file_path}: {str(e)}")
        else:
            print(f"- Skipped {file_path} (not found)")

    # Also upload entire src directory structure
    print("\nUploading source code...")
    for root, dirs, files in os.walk(os.path.join(source_dir, "app/src")):
        for file in files:
            if not file.endswith(('.pyc', '.log')):  # Skip compiled Python files and logs
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, source_dir)

                print(f"Uploading {rel_path}...")
                try:
                    api.upload_file(
                        path_or_fileobj=full_path,
                        path_in_repo=rel_path,
                        repo_id="Razaib123/aido-todo-api",
                        repo_type="space"
                    )
                    print(f"✓ Successfully uploaded {rel_path}")
                except Exception as e:
                    print(f"✗ Failed to upload {rel_path}: {str(e)}")

    print("\nUpload process completed!")

if __name__ == "__main__":
    upload_core_files()