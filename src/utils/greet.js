function greet() {
  var today = new Date();
  var curHr = today.getHours();

  if (curHr < 12) {
    return `Good morning!`;
  } else if (curHr < 18) {
    return `Good afternoon!`;
  } else {
    return `Good evening!`;
  }
}

export { greet };
