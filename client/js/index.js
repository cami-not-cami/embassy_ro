fetch('/dbq?id=123')
    .then(res => res.json())
    .then(data => console.log(data));