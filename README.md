This repository contains a client and server codebase. 

## Server Repository:

This codebase contains a list of laws (`docs/laws.pdf`) taken from the fictional series “Game of Thrones” (randomly pulled from a wiki fandom site... unfortunately knowledge of the series does not provide an edge on this assignment). Your task is to implement a new service (described in take home exercise document) and provide access to that service via a FastAPI endpoint running in a docker container. Please replace this readme with the steps required to run your app.

## Client Repository 

In the `frontend` folder you'll find a light NextJS app with it's own README including instructions to run. Your task here is to build a minimal client experience that utilizes the service build in part 1.


## Setup

### Requirements

* Docker
* Node.js (v18 or higher)
* OpenAI API key

### Setting up backend
1. Build the Docker image using the Dockerfile: `docker build -t norm-backend .`
2. Run the Docker container with your OpenAI API key: `docker run -p 8000:80 -e OPENAI_API_KEY=your_openai_api_key_here norm-backend`
3. API documentation will be available at `http://localhost:8000/docs` and the api can be individually tested

(after the initial setup the created container from the image can be run directly either with `docker run` or through Docker's ui.)

### Setting up frontend
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install` (or `pnpm install` / `yarn install`)
3. Run the development server: `npm run dev` (or `pnpm dev` / `yarn dev`)
4. The frontend will be available at `http://localhost:3000`

### Environment Variables
- `OPENAI_API_KEY`: Required for the backend to function properly. Set this when running the Docker container.

## Implementation

### Backend

The DocumentService was implemented first as sectioning was required for the query service to work as planned. Two options were added, a Regex based sectioning, that would work in documents with the same format as the provided `Laws.pdf` and an AI based Sectioning with OpenAI for more flexibility with differently formated docs. The pdf are transformed to markdown to easily extract text for sectioning, in case of more complex documents with diagrams and other visual elements, a diferent type of parsing could be required, such as visual procesing using AI, however that is fully out of scope for this excersice. 

Using the existing scafold and the Citation Query Engine the query service implementation was finished.

### Frontend

In the frontend a few components were added to be able to display the queries in a clear and useful manner. 
**Chat Screen** was added, it contains the inputs for the query including a the query itself, the path, and a checkbox for ai sectioning. Some simple verification was added and warnings with toasts were implmented to not send invalid api calls.
To emulate a AI chat, I treated the queries as a conversation (visually only, otherwise would be out of scope), so a **Query Component** was created separately and mapped to the "current convesation" state, which contains the query output from the api in an array. Using the existing header UI, I added the create new conversation modal which allows users to clear the current conversation after a warning dialog. and a add documents modal, which fully implementing would be out of scope for the time alloted, but could be done saving the responses in local storage, and creating a new endpoint that uses those saved documents instead of sectioning and saving to vector storage on every call.

## Reflective Response