import * as DNS from 'dns';
import * as OS from 'os';
import ExecUtils from '../ExecUtils';

/**
 * @classdesc Provides network-related utility methods.
 */
export default class NetworkInfo {
  /**
   * Gets the name of the host.
   * @returns The host name.
   */
  public static getHostName() {
    return OS.hostname();
  }

  /**
   * Get the fully-qualified domain name of the local host.
   * @returns The fully-qualified domain name (FQDN).
   */
  public static async getFQDN() {
    const result = await ExecUtils.executeCommand('hostname -f');
    if (result !== null) {
      return result[0];
    }

    return NetworkInfo.getHostName();
  }

  /**
   * Gets an array of all the IP addresses assigned to all the network interfaces.
   * @returns An array of IPv4/IPv6 addresses assigned to the local host.
   */
  public static getIPAddresses() {
    const addrs: string[] = [];

    const ifaces = OS.networkInterfaces();

    Object.keys(ifaces).forEach((ifname) => {
      ifaces[ifname]?.forEach((iface) => {
        if ((iface.family !== 'IPv4' && iface.family !== 'IPv6') || !iface.internal) {
          return;
        }
        addrs.push(iface.address);
      });
    });

    return addrs;
  }

  /**
   * Gets the IP address of the local system's hostname. This only works if the
   * hostname can be resolved.
   * @returns The IP address.
   */
  public static async getIPAddress() {
    const val = await ExecUtils.executeCommand('hostname --ip-address');
    return val[0];
  }

  /**
   * Gets all FQDNs of the machine. This enumerates all configured network
   * addresses on all configured network interfaces, and translates them to DNS
   * domain names. Addresses that cannot be translated (i.e. because they do not
   * have an appropriate reverse DNS entry) are skipped. Note that different
   * addresses may resolve to the same name, therefore the return value may
   * contain duplicate entries. Do not make any assumptions about the order of the
   * items in the array.
   * @return The FQDNs.
   */
  public static async getAllFQDNs() {
    const names = await ExecUtils.executeCommand('hostname --all-fqdns');
    return names[0].split(' ');
  }

  /**
   * Gets an array of all available name servers.
   * @returns The name servers.
   */
  public static getNameServers() {
    return DNS.getServers();
  }
}
