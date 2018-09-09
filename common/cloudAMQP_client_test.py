from cloudAMQP_client import CloudAMQPClient

CLOUDAMQP_URL = 'amqp://zjzllsqs:R8I54at6fKBzLo8GjG347CYgEYfvXuoz@sidewinder.rmq.cloudamqp.com/zjzllsqs'
QUEUE_NAME = 'test_queue'

# Initialize a client
client = CloudAMQPClient(CLOUDAMQP_URL, QUEUE_NAME)

# Send a message
client.sendDataFetcherTask({'name' : 'test message'})


# Receive a message
client.getDataFetcherTask()
