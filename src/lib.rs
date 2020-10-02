extern crate itertools_num;
extern crate pcg_rand;
extern crate rand;

mod controllers;
mod game_state;
mod geometry;
mod models;
mod util;

use std::os::raw::{c_double, c_int};
use std::sync::Mutex;

use pcg_rand::Pcg32Basic;
use rand::SeedableRng;

use self::controllers::{Actions, CollisionsController, TimeController};
use self::game_state::GameState;
use self::geometry::Size;

use wasm_bindgen::prelude::*;

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub struct GameData {
    state: GameState,
    actions: Actions,
    time_controller: TimeController<Pcg32Basic>,
}

#[wasm_bindgen]
impl GameData {
    pub fn new(width: f64, height: f64) -> GameData {
        GameData {
            state: GameState::new(Size::new(width, height)),
            actions: Actions::default(),
            time_controller: TimeController::new(Pcg32Basic::from_seed([42, 42])),
        }
    }

    pub fn update(&mut self, time: c_double) {
        self.time_controller
            .update_seconds(time, &self.actions, &mut self.state);
        CollisionsController::handle_collisions(&mut self.state);
    }

    pub fn toggle_shoot(&mut self, b: c_int) {
        //    let data = &mut DATA.lock().unwrap();
        self.actions.shoot = int_to_bool(b);
    }

    pub fn toggle_boost(&mut self, b: c_int) {
        //    let data = &mut DATA.lock().unwrap();
        self.actions.boost = int_to_bool(b);
    }

    pub fn toggle_turn_left(&mut self, b: c_int) {
        //    let data = &mut DATA.lock().unwrap();
        self.actions.rotate_left = int_to_bool(b);
    }

    pub fn toggle_turn_right(&mut self, b: c_int) {
        //    let data = &mut DATA.lock().unwrap();
        self.actions.rotate_right = int_to_bool(b);
    }

    pub fn resize(&self, width: c_double, height: c_double) -> GameData {
        GameData::new(width, height)
    }

    pub fn draw(&mut self) {
        use geometry::{Advance, Position};
        //    let data = &mut DATA.lock().unwrap();
        let world = &self.state.world;

        clear_screen();
        for particle in &world.particles {
            draw_particle(particle.x(), particle.y(), 5.0 * particle.ttl);
        }

        for bullet in &world.bullets {
            draw_bullet(bullet.x(), bullet.y());
        }

        for enemy in &world.enemies {
            draw_enemy(enemy.x(), enemy.y());
        }

        draw_player(world.player.x(), world.player.y(), world.player.direction());
        draw_score(self.state.score as f64);
    }
}

fn int_to_bool(i: c_int) -> bool {
    i != 0
}

// These functions are provided by the runtime
#[wasm_bindgen]
extern "C" {
    fn clear_screen();
    fn draw_player(_: c_double, _: c_double, _: c_double);
    fn draw_enemy(_: c_double, _: c_double);
    fn draw_bullet(_: c_double, _: c_double);
    fn draw_particle(_: c_double, _: c_double, _: c_double);
    fn draw_score(_: c_double);
}
