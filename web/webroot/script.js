document.getElementById('incrementButton').addEventListener('click', async () => {
  const response = await fetch('http://localhost:3000/v1/increment');
  document.getElementById('incrementOutput').textContent = "UPDATING...";
  const result = await response.json();
  document.getElementById('incrementOutput').textContent = JSON.stringify(result, null, 2);
});

document.getElementById('incrementNoMutexButton').addEventListener('click', async () => {
  const response = await fetch('http://localhost:3000/v1/increment_nomutex');
  document.getElementById('incrementNoMutexOutput').textContent = "UPDATING...";
  const result = await response.json();
  document.getElementById('incrementNoMutexOutput').textContent = JSON.stringify(result, null, 2);
});