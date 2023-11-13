// custom.d.ts
import { Index, RecordMetadata } from '@pinecone-database/pinecone'
import { VectorOperationsApi } from 'pinecone'

declare module 'pinecone' {
  interface PineconeLibArgs {
    pineconeIndex: Index<RecordMetadata>
  }
}
