from flask import Flask, request, jsonify
import subprocess

app = Flask(__name__)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()

    if 'prompt' in data:
        prompt = data['prompt']
        # Modify the command to call the generate.py script with the prompt
        cmd = ['python3', 'generate.py', '--quantize', 'llm.int8', '--prompt', prompt]
        
        # Execute the command and capture the output
        try:
            output = subprocess.check_output(cmd, stderr=subprocess.STDOUT, text=True)
            response = {'message': output}
            return jsonify(response), 200
        except subprocess.CalledProcessError as e:
            response = {'error': str(e.output)}
            return jsonify(response), 500
    else:
        response = {'error': 'Prompt not provided'}
        return jsonify(response), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
