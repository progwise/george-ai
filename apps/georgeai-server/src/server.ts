import 'dotenv/config';
import { createYoga } from 'graphql-yoga';
import { createServer } from 'node:http';
import { schema } from '@george-ai/pothos-graphql';

const yoga = createYoga({
  schema,
});
 
const server = createServer(yoga);
console.log('graphql server on 3000')
server.listen(3000);