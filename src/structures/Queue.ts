// Queue node class.
class QueueNode {
  public value: any;
  public next: QueueNode | null;
  // Builds a new QueueNode instance.
  constructor(value) {
    // Assign the provided value to the node.
    this.value = value;
    // Set the next node to null.
    this.next = null;
  }
}

// Queue class.
export default class Queue {
  public front: QueueNode | null;
  public rear: QueueNode | null;
  // Builds a new Queue instance.
  constructor() {
    // Set the front and rear nodes to null.
    this.front = null;
    // Set the rear node to null.
    this.rear = null;
  }
  public enqueue(value: any): void {
    const node = new QueueNode(value);

    if (this.rear === null) {
      this.front = node;
      this.rear = node;
    } else {
      this.rear.next = node;
      this.rear = node;
    }
  }
  public dequeue(): any {
    if (this.front === null) {
      this.rear = null;
      return null;
    } else {
      const node = this.front;
      this.front = this.front.next;
      return node.value;
    }
  }
}
