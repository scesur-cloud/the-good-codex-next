
import { TaskStatus } from '../types';

export enum Permission {
  CREATE_PROJECT = 'CREATE_PROJECT',
  DELETE_PROJECT = 'DELETE_PROJECT',
  EDIT_ROLE_LIB = 'EDIT_ROLE_LIB',
  EXECUTE_PHASE = 'EXECUTE_PHASE', // Can update DoD and produce Artifacts
  APPROVE_PHASE = 'APPROVE_PHASE', // Can move phase to DONE
  STOP_THE_LINE = 'STOP_THE_LINE', // Can move phase to BLOCKED
  VIEW_REPORTS = 'VIEW_REPORTS'
}

export const AuthService = {
  /**
   * Checks if a user with a specific role has a global permission.
   */
  hasPermission: (roleId: string, permission: Permission): boolean => {
    // GM_PM has full access to everything
    if (roleId === 'GM_PM') return true;

    switch (permission) {
      case Permission.CREATE_PROJECT:
      case Permission.DELETE_PROJECT:
      case Permission.EDIT_ROLE_LIB:
      case Permission.APPROVE_PHASE:
        return false; // Specialists cannot do these
      
      case Permission.EXECUTE_PHASE:
      case Permission.STOP_THE_LINE:
      case Permission.VIEW_REPORTS:
        return true; // All roles can execute their own tasks and view data
      
      default:
        return false;
    }
  },

  /**
   * Checks if a user can specifically act on a certain phase.
   */
  canActOnPhase: (roleId: string, phaseOwner: string, currentStatus: TaskStatus): boolean => {
    if (roleId === 'GM_PM') return true;
    
    // Specialists can only act on phases they own
    const isOwner = roleId === phaseOwner;
    
    // Owners cannot act if the phase is already DONE (needs GM to reopen)
    if (currentStatus === TaskStatus.DONE) return false;

    return isOwner;
  },

  /**
   * Checks if a user can approve a phase to DONE.
   */
  canApproveToDone: (roleId: string, currentStatus: TaskStatus): boolean => {
    // Only GM_PM can move a phase to DONE
    if (roleId !== 'GM_PM') return false;
    
    // GM can only approve if it's in REVIEW or IN_PROGRESS (not BLOCKED)
    return currentStatus === TaskStatus.REVIEW || currentStatus === TaskStatus.IN_PROGRESS;
  },

  /**
   * Defines UI labels for roles based on their level of authority.
   */
  getRoleBadge: (roleId: string) => {
    if (roleId === 'GM_PM') return { label: 'ACCOUNTABLE (A)', color: 'bg-indigo-600' };
    return { label: 'RESPONSIBLE (R)', color: 'bg-blue-500' };
  }
};
