import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/user";
import Order from "@/models/Order";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "quickcart-next" ,
  fetch: fetch.bind(globalThis),
});


/*
// Inngest function to save user data to a database
export const syncUserCreation = inngest.createFunction(
  {
    id: 'sync-user-from-clerk'
  },
  {
    event: 'clerk.user.created'
  },
  async ({event}) =>{
    const {id, first_name, last_name, email_addresses, image_url} = event?.data ;

    // if (!id) {
    //   console.log('missing user id in event data')
    //   throw new Error('Missing user ID in event data');
    // }

    const userData = {
      _id: id,
      name: first_name + ' ' + last_name,
      email: email_addresses[0]?.email_address,
      imageUrl: image_url
    }
    await connectDB()
    await User.create(userData)

    //     if (!userData) {
    //   console.log('missing userData')
    //   throw new Error('Missing userData  in event data');
    // }
  }
)
*/
export const syncUserCreation = inngest.createFunction(
  {
    id: 'sync-user-from-clerk'
  },
  {
    event: 'clerk.user.created'
  },
  async ({ event }) => {
    const data = event.data || {};

    const id = data.id;
    const first_name = data.first_name || '';
    const last_name = data.last_name || '';
    const email_addresses = data.email_addresses || [];
    const image_url = data.image_url || '';

    if (!id) {
      throw new Error('Missing user ID in Clerk event');
    }

    const userData = {
      _id: id,
      name: `${first_name} ${last_name}`.trim() || 'Unknown User',
      email: email_addresses[0]?.email_address || null,
      imageUrl: image_url
    };

    await connectDB();
    await User.create(userData);
  }
);
// Inngest function to update user data in database 
export const syncUserUpdate = inngest.createFunction(
  {
    id : 'update-user-from-clerk'
  },
  {
    event: 'clerk/user.updated'
  },

    async ({event}) =>{
    const {id, first_name, last_name, email_addresses, image_url} = event?.data || {};

    // if(!id){
    //   console.log('missing user id in event data')
    // }

    const userData = {
      _id: id,
      name: first_name + ' ' + last_name,
      email: email_addresses[0]?.email_address,
      imageUrl: image_url
    }
    await connectDB()
    await User.findByIdAndUpdate(id,userData)

    // if(!userData){
    //   console.log('missing userData')
    // }
  }
)

// Inngest function to delete user data in database 
export const syncUserDeletion = inngest.createFunction(
  {
    id : 'delete-user-with-clerk'
  },
  {
    event: 'clerk/user.deleted'
  },

    async ({event}) =>{
      const {id} = event?.data
      await connectDB()
      await User.findByIdAndDelete(id)
  }
)

// Inngest function to create user's order in database
export const createUserOrder = inngest.createFunction(
  {
    id: 'create-user-order',
    batchEvents: {
      maxSize: 5,
      timeout: '5s'
    }
  },
  {event: 'order/create'},
  async ({events}) =>{
    const orders = events.map((event) => {
      return {
        userId: event.data.userId,
        items: event.data.items,
        amount: event.data.amount,
        date: event.data.date,
      }
    })

    await connectDB()
    await Order.insertMany(orders)

    return {success : true, processed:orders.length  }
  }
)
