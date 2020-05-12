/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

const GLib = imports.gi.GLib;
const GnomeSession = imports.misc.gnomeSession;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const Shell = imports.gi.Shell;
const St = imports.gi.St;
const System = imports.system;
const Clutter = imports.gi.Clutter;

class Extension {
    constructor() {
    }

    init() {
        this.trayBox = new St.BoxLayout({
            name: 'panelTray',
            style_class: 'panel-tray',
            x_align: Clutter.ActorAlign.CENTER,
            y_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
            y_expand: true,
        });
        this.container = new PanelMenu.ButtonBox({visible: true});
        this.container.add_actor(this.trayBox);

        this.tray = new Shell.TrayManager();
        this.tray.connect('tray-icon-added', this.onIconAdded.bind(this));
        this.tray.connect('tray-icon-removed', this.onIconRemoved.bind(this));
        this.tray.manage_screen(Main.panel);

        let parent = this.container.get_parent();
        if (parent) {
            parent.remove_actor(this.container);
        }
        Main.panel._rightBox.insert_child_at_index(this.container, 0);
    }

    onIconAdded(_, icon) {
        let button = new St.Button({
            style_class: 'tray-button',
            x_align: Clutter.ActorAlign.CENTER,
            y_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
            y_expand: true,
            child: icon
        });
        button.connect('button-release-event', (_, event) => {
            icon.click(event)
        });
        this.trayBox.add_child(button);
    }

    onIconRemoved(_, icon) {
        let button = icon.get_parent();
        if (button) {
            this.trayBox.remove_child(button);
            button.destroy();
        }
    }

    destroy() {
        let children = this.trayBox.get_children()
        for (let i in children) {
            children[i].destroy();
        }
        this.trayBox.destroy();
        this.trayBox = null;
        this.container.destroy();
        this.container = null;
        this.tray = null;

        System.gc();
    }

    enable() {
        this.init()
    }

    disable() {
        this.destroy()
    }
}

function init() {
    return new Extension();
}
