#!/usr/bin/env python3
"""
Simple HTTP server for GRE Vocabulary Builder
Run this to serve the website locally
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8001

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers to allow loading JSON files
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def main():
    # Change to the directory containing the files
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Check if vocabulary file exists
    if not os.path.exists('vocabulary_persian_final.json'):
        print("❌ Error: vocabulary_persian_final.json not found!")
        print("Please make sure the vocabulary file is in the same directory as this script.")
        sys.exit(1)
    
    # Check for other required files
    required_files = ['index.html', 'styles.css', 'script.js', 'manifest.json']
    missing_files = [f for f in required_files if not os.path.exists(f)]
    
    if missing_files:
        print(f"⚠️  Warning: Missing files: {', '.join(missing_files)}")
        print("Some features may not work properly.")
    
    # Start the server
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print(f"GRE Vocabulary Builder server running at:")
        print(f"http://localhost:{PORT}")
        print(f"Press Ctrl+C to stop the server")
        
        # Try to open the browser automatically
        try:
            webbrowser.open(f'http://localhost:{PORT}')
        except:
            pass
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
            httpd.shutdown()

if __name__ == "__main__":
    main()
