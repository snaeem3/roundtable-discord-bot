import { Player } from './Player';
import moveLivingToDead from './moveLivingToDead';

let player1: Player;
let player2: Player;
let player3: Player;

let livingPlayers: Player[];
let deadPlayers: Player[];
let playersToMove: Player[];

beforeEach(() => {
  player1 = new Player('01234', 'John');
  player2 = new Player('56789', 'Sarah');
  player3 = new Player('13579', 'George');
});

test('Correct players can successfully move 1 player from living to dead', () => {
  livingPlayers = [player1, player2, player3];
  deadPlayers = [];

  playersToMove = [player1];
  const { updatedLivingPlayers, updatedDeadPlayers } = moveLivingToDead(
    livingPlayers,
    deadPlayers,
    playersToMove,
  );
  expect(updatedLivingPlayers).toHaveLength(2);
  expect(updatedDeadPlayers).toHaveLength(1);
});

test('Correct players can successfully move multiple players from living to dead', () => {
  livingPlayers = [player1, player2, player3];
  deadPlayers = [];

  playersToMove = [player1, player2, player3];
  const { updatedLivingPlayers, updatedDeadPlayers } = moveLivingToDead(
    livingPlayers,
    deadPlayers,
    playersToMove,
  );
  expect(updatedLivingPlayers).toHaveLength(0);
  expect(updatedDeadPlayers).toHaveLength(3);
});
