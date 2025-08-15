import http.server
import socketserver
import os

PORT = 8000
DIRECTORY = "."

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

os.chdir(DIRECTORY)

with socketserver.TCPServer(("", PORT), MyHandler) as httpd:
    print(f"Serving files from directory: {os.path.abspath(DIRECTORY)}")
    print(f"Server started at http://localhost:{PORT}")
    print("Press Ctrl+C to stop the server.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
