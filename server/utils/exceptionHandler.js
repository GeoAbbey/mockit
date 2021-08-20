export function exceptionHandler({ message, status }) {
  this.message = message;
  this.name = "exceptionHandler";
  this.status = status;
}
