import os
from huggingface_hub import HfApi
import tempfile

def upload_files_to_space():
    api = HfApi()

    # Define the files to upload from the hf-space directory
    files_to_upload = [
        ("README.md", "./hf-space/README.md"),
        ("Dockerfile", "./hf-space/Dockerfile"),
    ]

    # Add all files from the app directory
    import os
    for root, dirs, files in os.walk("./hf-space/app"):
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, "./hf-space")
            files_to_upload.append((rel_path, full_path))

    print(f"Found {len(files_to_upload)} files to upload")

    # Upload each file
    for path_in_repo, file_path in files_to_upload:
        try:
            print(f"Uploading {file_path} -> {path_in_repo}")
            api.upload_file(
                path_or_fileobj=file_path,
                path_in_repo=path_in_repo,
                repo_id="Razaib123/aido-todo-api",
                repo_type="space",
            )
            print(f"✓ Uploaded {path_in_repo}")
        except Exception as e:
            print(f"✗ Failed to upload {path_in_repo}: {e}")

    print("Upload process completed!")

if __name__ == "__main__":
    upload_files_to_space()