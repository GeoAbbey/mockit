export function exceptionHandler({ message, status, name }) {
  this.message = message;
  this.name = name || "exceptionHandler";
  this.status = status;
}
