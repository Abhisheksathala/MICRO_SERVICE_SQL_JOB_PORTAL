import { Kafka } from "kafkajs";
import nodemailer from "nodemailer"



export const startSendMailConsumer = async () => {
  try {
    const kafka = new Kafka({
      clientId: "mail-service",
      brokers: [process.env.KAFKA_BROKER! || 'localhost:9092']
    })
    const consumer = kafka.consumer({
      groupId: "mail-service",
    })
    await consumer.connect();
    const topicName = 'send-mail'
    await consumer.subscribe({
      topic: topicName, fromBeginning: false
    })
    console.log("Consumer connected and subscribed to topic")
    await consumer.run({
      eachMessage: async ({ topic = "", partition = 0, message }) :Promise<void> => { 
        try {
          const { to, subject, html } = JSON.parse(message.value?.toString()! || '{}')
          const transporter = nodemailer.createTransport({
            service: "gmail", 
            host: "smpt.gmail.com", 
            port: 465,
            secure: true,
            auth: {
              user: "xyz",
              pass: "123"
            }

          })
          await transporter.sendMail({
            from: "xyz <[EMAIL_ADDRESS]>",
            to: to,
            subject: subject,
            html: html
          })
          console.log(`mail has been sent to ${to} successfully`);
        } catch (error) {
          console.log(error, "failed to send the email")
        }
      }
    })

  } catch (error) {
    console.log(error, "failed to start mail consumer kafkajs")
  }
}