/** Represents a node in a queue. */
class QueueNode {
  public value: any;
  public next: QueueNode | null;

  /**
   * Instantiates a new QueueNode instance.
   * @param value - The value to store in the node.
   */
  constructor(value) {
    // Assign the provided value to the node.
    this.value = value;
    // Set the next node to null.
    this.next = null;
  }
}

/** Class for creating a queue. */
export default class Queue {
  public front: QueueNode | null;
  public rear: QueueNode | null;

  /** Builds a new Queue instance. */
  constructor() {
    // Set the front and rear nodes to null.
    this.front = null;
    // Set the rear node to null.
    this.rear = null;
  }

  /**
   * Removes a value from the queue.
   * @returns The value at the front of the queue.
   */
  public dequeue(): any {
    // If the front of the queue is null, the queue is empty.
    if (this.front === null) {
      this.rear = null;
      return null;
    }
    // If the front of the queue is not null, remove the value from the front of the queue.
    else {
      const node = this.front;
      this.front = this.front.next;
      return node.value;
    }
  }

  /**
   * Adds a value to the queue.
   * @param value - The value to enqueue.
   */
  public enqueue(value: any): void {
    // Create a new node to store the value.
    const node = new QueueNode(value);

    // If the rear of the queue is null, the queue is empty.
    if (this.rear === null) {
      this.front = node;
      this.rear = node;
    }
    // If the rear of the queue is not null, add the value to the rear of the queue.
    else {
      this.rear.next = node;
      this.rear = node;
    }
  }
}
