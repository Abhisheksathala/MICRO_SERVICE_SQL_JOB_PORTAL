import { Kafka, type Producer, type Admin } from "kafkajs";
import "dotenv/config";


let producer: Producer;
let admin: Admin;




export const connectKafkaProducer = async (): Promise<void> => {
  try {
    const kafka = new Kafka({
      clientId: "mail-service",
      brokers: [process.env.KAFKA_BROKER! || 'localhost:9092']
    })

    admin = kafka.admin()
    await admin.connect()

    const topics = await admin.listTopics()

    if (!topics) {
      await admin.createTopics({
        topics: [
          {
            topic: "send-mail",
            numPartitions: 1,
            replicationFactor: 1
          }
        ]
      })
      console.log("topic created")
    }

    await admin.disconnect()

    producer = kafka.producer();
    await producer.connect();
    console.log("producer connected")

  } catch (error) {
    console.log(error, "failed to produce connectin kafkajs")
  }
}


export const PublishToTopic = async (topic: string, message: any) => {
  try {
    if (!producer) {
      throw new Error("producer not initialized")
    }
    await producer.send({
      topic: topic,
      messages: [
        {
          value: JSON.stringify({ message })
        }
      ]
    })
    console.log(`message published to topic ${topic}`)
  } catch (error: any) {
    console.log(error && error?.message, "failed to publish message to topic")
  }
}


export const disconnectKafka = async ():Promise<void> => {
  if(!producer) {
    console.log("producer not initialized")
    return;
  };
  try {
    await producer.disconnect();
    console.log("producer disconnected")
  } catch (error: any) {
    console.log(error && error?.message, "failed to disconnect kafka")
  }
}