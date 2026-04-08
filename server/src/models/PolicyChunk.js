const mongoose = require('mongoose');

const PolicyChunkSchema = new mongoose.Schema({
  title: String,
  text: String,
  filename: String
});

module.exports = mongoose.model('PolicyChunk', PolicyChunkSchema);
