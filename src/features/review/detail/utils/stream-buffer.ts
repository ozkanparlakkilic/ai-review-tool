export class StreamBuffer {
  private buffer = "";

  append(chunk: string) {
    this.buffer += chunk;
  }

  flush() {
    const content = this.buffer;
    this.buffer = "";
    return content;
  }

  get current() {
    return this.buffer;
  }
}
