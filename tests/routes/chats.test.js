// const request = require('supertest');
// const app = require('../../src/index');
// const User = require('../../src/models').User;
// const jwt = require('jsonwebtoken');

// let server;
// let userToken;
// let chatId;
// let userId;


// beforeAll(done => {
// 	server = app.listen(4000, () => {
// 		done();
// 	});
// });



// describe('Chat Controller Tests', () => {


// beforeAll(async () => {
//   // Start the server and create a test user
//   await require('../setup')();  // Ensure setup works properly
 
//   // Create a user for authentication
//   const user = await User.create({
//     name: 'Test User 2',
//     email: 'test2@gmail.com',
//     about: 'Test user for authentication API tests',
//     image: 'test-image-url',
//   });

//   userId = user.id;

//   // Generate a JWT token for the user
//   userToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
//     expiresIn: '1h',
//   });

//   console.log('Generated JWT token:', userToken);  // Debugging line to check token
// });

// afterAll(async () => {
//   await require('../tearDown')();  // Ensure teardown works properly
//   // await server.close();
//   await new Promise(resolve => server.close(resolve));
// });


	
//   describe('POST /chats', () => {
//     it('should create a one-to-one chat successfully', async () => {
//       const payload = { type: 'one-to-one', user_ids: [userId] };

//       const response = await request(app)
//         .post('/chats')
//         .set('authorization', userToken)  // Pass the token directly
//         .send(payload);

//       console.log('Response Body:', response.body);  // Debugging line to check response
//       expect(response.status).toBe(201);
//       expect(response.body.message).toBe('Chat successfully created');
//       expect(response.body.response).toHaveProperty('id');
//       chatId = response.body.response.id;  // Store the chat ID for further tests
//     });

//     it('should create a group chat successfully', async () => {
//       const payload = {
//         type: 'group',
//         name: 'Test Group',
//         description: 'A test group chat',
//         user_ids: [userId],
//       };

//       const response = await request(app)
//         .post('/chats')
//         .set('authorization', userToken)  // Pass token directly
//         .send(payload);

//       expect(response.status).toBe(201);
//       expect(response.body.message).toBe('Chat successfully created');
//       expect(response.body.response).toHaveProperty('id');
//     });
//   });

//   describe('GET /chats/:chatId', () => {
//     it('should get chat details successfully', async () => {
//       console.log('Using chatId:', chatId);  // Debugging line to check if chatId is valid

//       const response = await request(app)
//         .get(`/chats/${chatId}`)
//         .set('authorization', userToken);  // Pass token directly

//       expect(response.status).toBe(200);
//       expect(response.body.message).toBe('Chat details retrieved successfully');
//       expect(response.body.response).toHaveProperty('id', chatId);
//     });

//     it('should return error if chat does not exist', async () => {
//       const response = await request(app)
//         .get('/chats/9999')  // Non-existent chatId
//         .set('authorization', userToken);

//       expect(response.status).toBe(404);
//       expect(response.body.message).toBe('Chat does not exist');
//     });
//   });

//   describe('PUT /chats/:chatId', () => {
//     it('should update the group chat successfully', async () => {
//       const payload = {
//         name: 'Updated Group Name',
//         description: 'Updated description',
//       };

//       const response = await request(app)
//         .put(`/chats/${chatId}`)
//         .set('authorization', userToken)  // Pass token directly
//         .send(payload);

//       expect(response.status).toBe(202);
//       expect(response.body.message).toBe('Group chat updated successfully');
//     });

//     it('should return error if user is not authorized to edit the chat', async () => {
//       const payload = {
//         name: 'Updated Group Name',
//         description: 'Updated description',
//       };

//       const unauthorizedToken = 'invalidtoken';  // Simulating an invalid token

//       const response = await request(app)
//         .put(`/chats/${chatId}`)
//         .set('authorization', unauthorizedToken)  // Invalid token for testing
//         .send(payload);

//       expect(response.status).toBe(403);
//       expect(response.body.message).toBe('User is not admin of the chat');
//     });
//   });

//   describe('DELETE /chats/:chatId', () => {
//     it('should delete the chat successfully', async () => {
//       const response = await request(app)
//         .delete(`/chats/${chatId}`)
//         .set('authorization', userToken);  // Pass token directly

//       expect(response.status).toBe(202);
//       expect(response.body.message).toBe('Chat deleted successfully');
//     });

//     it('should return error if chat does not exist', async () => {
//       const response = await request(app)
//         .delete('/chats/9999')  // Non-existent chatId
//         .set('authorization', userToken);

//       expect(response.status).toBe(404);
//       expect(response.body.message).toBe('Chat does not exist');
//     });
//   });
// });
