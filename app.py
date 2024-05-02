from flask import Flask, request, render_template

app = Flask(__name__)
received_data = []  # This will store our webhook data

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def webhook():
    data = request.json
    received_data.append(data)  # Store received data
    print("Received data:", data)
    return "Webhook received!", 200

@app.route('/view-data')
def view_data():
    return render_template('data.html', data=received_data)

if __name__ == '__main__':
    app.run(port=5000)
