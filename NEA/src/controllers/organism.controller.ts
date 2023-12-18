import Organism from "../models/Organism";

export type NodeType = Node | null;

/** Linked list used for storing pointers to organisms. */
export class OrganismController {
  private _head: NodeType;
  private _tail: NodeType;
  private _size: number;

  constructor() {
    this._head = null;
    this._tail = null;
    this._size = 0;
  }

  /** Returns the first organism node in the list. */
  public get head(): NodeType {
    if (this._head) return this._head;
    else return null;
  }

  /** Updates the first organism node in the list. */
  public set head(node: NodeType) {
    this._head = node;
  }

  /** Returns the last organism node in the list. */
  public get tail(): NodeType {
    if (this._tail) return this._tail;
    else return null;
  }

  /** Updates the last organism node in the list. */
  public set tail(node: NodeType) {
    this._tail = node;
  }

  /** Returns the size of the list. */
  public get size(): number {
    return this._size;
  }

  /** Updates the size of the list. */
  public set size(size) {
    this._size = size;
  }

  /** Prepends a new organism to the list. */
  public insert_at_head(organism: Organism): void {
    const node = new Node(organism);
    if (this.head) {
      /** List is not empty. */
      this.head.prev = node;
      node.next = this.head;
      this.head = node;
    } else {
      /** List is empty * */
      this.head = node;
      this.tail = node;
    }
  }

  /** Appends a new organism to the list. */
  public insert_at_tail(organism: Organism): void {
    const node = new Node(organism);
    if (this.tail) {
      /** List is not empty. */
      this.tail.next = node;
      node.prev = this.tail;
      this.tail = node;
    } else {
      /** List is empty. */
      this.head = node;
      this.tail = node;
    }
  }

  /** Deletes the specified node from the list. */
  public delete(node: Node): void {
    // Issue relating to organisms dying due to radioactive cells are here.
    if (node.prev) {
      /** Update previous node.next to node.next. */
      node.prev.next = node.next;
    } else {
      /** Update head next to node.next. */
      this.head!.next = node.next;
    }

    if (node.next) {
      /** Update next node.prev to node.prev. */
      node.next.prev = node.prev;
    } else {
      /** Update tail prev to node.prev. */
      this.tail!.prev = node.prev;
    }
  }
}

export class Node {
  public organism: Organism;
  public next: NodeType;
  public prev: NodeType;
  constructor(organism: Organism) {
    this.organism = organism;
    this.next = null;
    this.prev = null;
  }
}
