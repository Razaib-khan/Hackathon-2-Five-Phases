from huggingface_hub import create_repo, upload_folder
import os

# Create the Space repository
try:
    create_repo(
        repo_id="Razaib123/aido-todo-backend",
        token=os.environ.get("HF_TOKEN"),  # You'll need to set this environment variable
        repo_type="space",
        space_sdk="docker",
        exist_ok=True
    )
    print("Space repository created successfully!")
except Exception as e:
    print(f"Error creating space: {e}")

    # If the space already exists, we can still proceed with uploads
    if "already exists" in str(e):
        print("Space already exists, proceeding with upload...")