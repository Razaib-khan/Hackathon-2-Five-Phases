#!/usr/bin/env python3
import os
from huggingface_hub import HfApi
import tempfile
import shutil

def sync_space_files():
    # Initialize the API client
    api = HfApi()

    # Source directory with our prepared files
    source_dir = "/mnt/d/Hackathon 2 FIve Phases/hf-space"

    # Get list of all files to upload
    files_to_upload = []

    # Walk through the source directory
    for root, dirs, files in os.walk(source_dir):
        for file in files:
            # Get the full path
            full_path = os.path.join(root, file)

            # Calculate the relative path from source_dir
            rel_path = os.path.relpath(full_path, source_dir)

            files_to_upload.append((full_path, rel_path))

    print(f"Found {len(files_to_upload)} files to upload")

    # Upload each file to the space
    for local_path, repo_path in files_to_upload:
        print(f"Uploading {repo_path}...")
        try:
            api.upload_file(
                path_or_fileobj=local_path,
                path_in_repo=repo_path,
                repo_id="Razaib123/aido-todo-api",
                repo_type="space"
            )
            print(f"✓ Successfully uploaded {repo_path}")
        except Exception as e:
            print(f"✗ Failed to upload {repo_path}: {str(e)}")

    print("\nUpload completed!")

if __name__ == "__main__":
    sync_space_files()