# AI Chat Developer

AI Chat Developer is a unique project that integrates OpenAI's GPT-3 model to act as a frontend developer within a chat interface. Users can communicate with the AI, which understands and executes development-related tasks, such as creating files, folders, and writing code.

## Features:

- **Server**: Built with Node.js and Express.js.
- **Real-time Chat**: Uses Socket.io for real-time bi-directional communication.
- **GPT-3 Integration**: Connects to OpenAI's GPT-3 model for intelligent responses.
- **Development Tasks**: AI can create, update, and manage files/folders based on user requests.

## Getting Started:

### Prerequisites:

- Node.js and npm installed.
- An API key from OpenAI.

### Setup:

1. **Clone the Repository**:

` git clone repo`

2. **Install Dependencies**:
   `npm install`
3. **Set Up OpenAI API Key**:

- Create a `.env` file in the root directory.
- Add your OpenAI API key:
  `OPENAI_API_KEY=YOUR_OPENAI_API_KEY`

4. **Start the Server**:
   `npm start`
5. **Access the Chat UI**:

- Open your browser and navigate to `http://localhost:3000`.
- Start chatting with the AI developer!
- you can view the generate projects here `http://localhost:3000/dev`.

## Usage:Once the server is running and you've accessed the chat UI:

1. **Initial Message**: The AI will provide an initial message detailing its capabilities and how to interact with it.
2. **Development Tasks**: You can ask the AI to perform various development tasks, such as creating a new project, adding files, or writing specific code.
3. **Real-time Feedback**: The AI will respond in real-time, executing your requests and providing feedback or the generated code.

## Contributing:

Feel free to fork the project, make changes, and submit pull requests. All contributions are welcome!

## License:

This project is open-source and available under the MIT License.
