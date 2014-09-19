# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.define 'flippermaps' do |machine|
    machine.vm.box = "ubuntu/trusty64"
    machine.vm.hostname = "flippermaps.dev"

    machine.vm.network "private_network", ip: "192.168.33.125"

    machine.vm.provision :ansible do |ansible|
      ansible.inventory_path = "provisioning/hosts-vagrant"

      ansible.sudo = true
      ansible.playbook = "provisioning/flippermaps.yml"
      ansible.limit = 'all'
      ansible.verbose = 'v'
    end

    # machine.vm.synced_folder ".", "/vagrant", type: "nfs"
    machine.vm.synced_folder ".", "/home/flippermaps/flippermaps", type: "nfs"

    machine.vm.provider "virtualbox" do |vb|
      vb.name = "flippermaps"
      vb.customize ["modifyvm", :id, "--memory", "1024"]
    end
  end
end

