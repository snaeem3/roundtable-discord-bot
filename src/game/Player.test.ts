import { Player } from './Player';

let player1: Player;
let player2: Player;

beforeEach(() => {
  player1 = new Player('01234', 'John');
  player2 = new Player('56789', 'Sarah');
});

test('Player can not have the same ally in unique alliances', () => {
  player1.addUniqueAlly(player2);
  player1.addUniqueAlly(player2);
  expect(player1.uniqueAlliances).toHaveLength(1);
});
