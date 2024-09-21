# Video Streaming Platform with HLS

This project demonstrates how to build a video streaming platform using **HLS (HTTP Live Streaming)**. The application allows users to upload videos, which are then processed into different resolutions and segmented for efficient streaming. This project replicates how major platforms like **Netflix**, **YouTube**, and **Udemy** handle video streaming, leveraging chunk-based video uploading and adaptive streaming.

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Cloud Services**: AWS S3 (Storage), AWS SQS (Messaging Queue)
- **Video Processing**: FFMPEG (For converting videos into different resolutions and segments)

## Application Flow

### 1. User Authentication
- Users authenticate via **Google Sign-In** to upload videos securely.

### 2. Video Upload
- The video is uploaded in chunks using **Multipart Upload API** from AWS S3 to handle large file uploads efficiently.

### 3. AWS SQS Integration
- **AWS SQS (Simple Queue Service)** is used as a messaging queue.
- Once a video is uploaded to S3, it triggers a message to SQS with the details of the newly uploaded video.

### 4. SQS Polling and Video Processing
- The backend service constantly polls the SQS at regular intervals (every 5 seconds).
- When a new video message is received, the video is downloaded from S3, and **FFMPEG** is used to create **HLS streams** in different resolutions:
  - 320p
  - 480p
  - 720p
- FFMPEG generates `.m3u8` and `.ts` files for each resolution, as well as a **master `.m3u8` file** that references all the different resolution streams.

### 5. Upload Segments and HLS Files
- The `.m3u8` files and their corresponding `.ts` segments are uploaded back to AWS S3.
- Metadata about the video (such as resolutions and segment details) is saved in the PostgreSQL database.

### 6. Video Playback
- The backend generates **presigned URLs** for the `.m3u8` files, which can then be used by the frontend to stream the video.
- The user can choose between different resolutions, and the video will stream seamlessly using HLS.

## Features

- **Google OAuth 2.0** for secure user authentication.
- **Multipart Upload** for efficient large file uploads.
- **AWS SQS** for real-time event-driven processing.
- **FFMPEG** for converting videos into multiple resolutions and creating HLS streams.
- **HLS Streaming** with adaptive bitrate streaming using `.m3u8` and `.ts` files.
- **PostgreSQL** for storing video metadata.
- **React Frontend** for a seamless user interface.

## Installation

### Prerequisites

- **Node.js** and **npm** installed.
- **FFMPEG** installed on your local machine.
- AWS account with access to **S3** and **SQS**.
- **PostgreSQL** database setup.

### Backend Setup

1. Clone the repository:

    ```bash
    git clone https://github.com/rishabhm05/videostream-systemdesign.git
    ```

2. Navigate to the backend directory:

    ```bash
    cd backend
    ```

3. Install backend dependencies:

    ```bash
    npm install
    ```

4. Set up your environment variables in a `.env` file:

    ```bash
    touch .env
    ```

    Add the following variables in the `.env` file:

    ```bash
    AWS_ACCESS_KEY_ID=<your-access-key>
    AWS_SECRET_ACCESS_KEY=<your-secret-key>
    AWS_REGION=<your-aws-region>
    S3_BUCKET_NAME=<your-s3-bucket-name>
    SQS_QUEUE_URL=<your-sqs-queue-url>
    DATABASE_URL=<your-postgres-database-url>
    ```

5. Start the backend server:

    ```bash
    npm start
    ```

### Frontend Setup

1. Navigate to the frontend directory:

    ```bash
    cd frontend
    ```

2. Install frontend dependencies:

    ```bash
    npm install
    ```

3. Set up the frontend environment variables in a `.env` file:

    ```bash
    touch .env
    ```

    Add necessary environment variables:

    ```bash
    REACT_APP_BACKEND_URL=<your-backend-url>
    REACT_APP_GOOGLE_CLIENT_ID=<your-google-client-id>
    ```

4. Start the frontend server:

    ```bash
    npm start
    ```

## Usage

- **Video Upload**: After signing in with Google, users can upload videos. These will be processed and streamed using HLS in the frontend.
- **Adaptive Streaming**: The video will be streamed in different resolutions, allowing the user to switch between them or have the player automatically adjust based on bandwidth.

## Future Enhancements

- Add **support for more resolutions** like 1080p or 4K.
- **Video search and management** features in the frontend.
- Implement **webhooks** for better event-driven communication between S3 and the backend.
- Use **CDN** for faster video delivery.

## License

This project is licensed under the MIT License.
