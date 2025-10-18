export function genUsername() {
  return `user_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function genValidPassword() {
  const base = Math.random().toString(36).slice(2, 10);
  return `Aa!${base}1`;
}

export function genFirstName() {
  const names = ['Ana', 'Bruno', 'Carla', 'Diego', 'Eva', 'Fabio'];
  return names[Math.floor(Math.random() * names.length)];
}

export function genLastName() {
  const names = ['Silva', 'Souza', 'Oliveira', 'Lima', 'Costa', 'Pereira'];
  return names[Math.floor(Math.random() * names.length)];
}

export function genEmail() {
  return `qa_${Date.now()}_${Math.random().toString(36).slice(2,6)}@example.com`;
}

export function genMobile() {
  return String(9000000000 + Math.floor(Math.random() * 999999999)).slice(0,10);
}

export function genAddress() {
  return `Rua ${Math.random().toString(36).slice(2,7)} ${Math.floor(Math.random()*1000)}`;
}

