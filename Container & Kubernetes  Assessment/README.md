# Docker Overview and Security Resources

Docker is a platform that uses container technology to automate application deployment, ensuring consistent performance across different environments. It enhances portability, efficiency, version control, and orchestration for scalable and isolated application deployment. However, Docker can have security issues such as vulnerabilities in container images, misconfigurations, and risks associated with shared kernel resources.

## Core Concepts

Container and Kubernetes assessment evaluates how images, containers, and the orchestrator are built and configured. Containers share the host kernel rather than fully virtualizing it, so the central question is whether an attacker can break out of a container or move laterally across the cluster.

**Methodology / Phases:**
- Scan images: check base images and layers for vulnerabilities, embedded secrets, and excessive contents.
- Review runtime config: privileged containers, mounted host paths, capabilities, and exposed sockets (e.g. the Docker socket).
- Test container escape: kernel exploits, misconfigurations, and dangerous mounts that reach the host.
- Assess the cluster: Kubernetes RBAC, service accounts, network policies, secrets handling, and the API server exposure.
- Map lateral movement: from a pod to other pods, nodes, the control plane, and cloud metadata/credentials.

**Key Concepts / What to look for:**
- Privileged and over-capable containers: `--privileged`, added capabilities, and host namespace sharing.
- Dangerous mounts: the Docker socket, host filesystem, or `/proc` exposed inside a container.
- Image hygiene: vulnerable packages, hardcoded secrets, and outdated or unpinned base images.
- Kubernetes RBAC and secrets: overly broad roles, default tokens, and plaintext or readable secrets.
- Weak isolation: missing network policies, exposed dashboards/kubelet, and reachable cloud metadata.

| Credit          | Details                                   |
|-----------------|-------------------------------------------|
| CSbyGB         | [CSbyGB](https://github.com/CSbyGB)       |
|    Madhurendra Kumar             |  [m14r41](https://github.com/m14r41/PentestingEverything/edit/main/DockerContainer%20Pentesting/README.md)                   |

## What is Docker?
- [Docker Overview on Docker Docs](https://lnkd.in/eRkNTVNu)
- [What is Docker and How it Works on Simplilearn](https://lnkd.in/ep8T7yUM)
- [Linux Containers - Basic Concepts by Lucian Carata](https://lnkd.in/eJDs9khW)

## Docker Pentest & Security Resources
- [My Pentips about Docker on C.S by G.B](https://lnkd.in/eV_fPjsP)
- 2 amazing blog posts by Dana Epp (I recommend subscribing to his newsletter):
  - [Defeating a Dockerized API to Get Access to Source Code](https://lnkd.in/eYGpm3Pe)
  - [Finding API Secrets in Hidden Layers within Docker Containers](https://lnkd.in/eFPJrejZ)
- [Docker Vulnerabilities on CVE Details](https://lnkd.in/eFjysgbX)
- [Privilege Escalation via Docker by Chris Foster](https://lnkd.in/e5cJtJcx)
- [The Dirty COW Kernel Exploit](https://lnkd.in/ew-5vuEf)
- [Breaking Out of Docker via runC - CVE-2019-5736 by Yuval Avrahami](https://lnkd.in/ePhSRRmW)
- [Understanding Docker Container Escapes by Dominik Czarnota on TrailofBits](https://lnkd.in/ee-9HJX6)
- [Awesome Docker Security by Myugan](https://lnkd.in/esVcibK8)
- [Docker Security Cheat Sheet by OWASP® Foundation](https://lnkd.in/eGDBhgai)
- [Docker Security Course - Hackersploit](https://lnkd.in/ey-dVnh4)

## Read Writeups
- [Hack The Box UltraTech](https://lnkd.in/eRW8Xtyk)
- [Hack The Box Toolbox](https://lnkd.in/e4R6BeRz)
- [Hack The Box Shoppy](https://lnkd.in/e3iekCMJ)
- [Hack The Box Mentor](https://lnkd.in/enXAHbKh)

## Practice
- [TryHackMe UltraTech Box](https://lnkd.in/eGHg-KZn)
- [Writeup UltraTech](https://lnkd.in/eRW8Xtyk)
- [Root-Me Docker - I Am Groot](https://lnkd.in/eyBwWC7J)
- [Docker - Talk Through Me](https://lnkd.in/eTYEtFKd)
- [Supply Chain Attack - Docker](https://lnkd.in/ezH7237x)
- [Docker Layers](https://lnkd.in/eZs5JQ7S)
- [Docker - Sys-Admin’s Docker](https://lnkd.in/enDBbwa3)
- [Damn Vulnerable Docker Container by Julian Scionti](https://lnkd.in/eyj8uyux)
- [Docker Host Attacks on Attackdefense](https://lnkd.in/e78jYrz2)


 



# Docker Penetration Testing Check List:

## 1. Container Security Assessment:

   - **Test Case:** Identify and assess security configurations and vulnerabilities in Docker containers.
   - **Commands/Tools:**
     ```bash
     # Inspect container details
     docker inspect <container-id>
     
     # Check for changes in container filesystem
     docker diff <container-id>
     ```

   - **Example:**
     ```bash
     # Inspect container named 'web-container'
     docker inspect web-container
     ```

## 2. Container Image Analysis:

   - **Test Case:** Analyze container images for vulnerabilities and misconfigurations.
   - **Commands/Tools:**
     ```bash
     # List available images
     docker image ls
     
     # Inspect details of a specific image
     docker image inspect <image-id>
     ```

   - **Example:**
     ```bash
     # Inspect details of the 'nginx' image
     docker image inspect nginx
     ```

## 3. Exposed Ports:

   - **Test Case:** Identify exposed ports and assess their security.
   - **Commands/Tools:**
     ```bash
     # List port mappings of a running container
     docker port <container-id>
     ```

   - **Example:**
     ```bash
     # List port mappings for container 'web-app'
     docker port web-app
     ```

## 4. Privilege Escalation:

   - **Test Case:** Check for potential privilege escalation vulnerabilities.
   - **Commands/Tools:**
     ```bash
     # Access container with root privileges
     docker exec -u 0 -it <container-id> /bin/bash
     ```

   - **Example:**
     ```bash
     # Access 'database-container' with root privileges
     docker exec -u 0 -it database-container /bin/bash
     ```

## 5. Container Breakout:

   - **Test Case:** Attempt to escape from the container and access the host system.
   - **Commands/Tools:**
     ```bash
     # Run a privileged container and break out
     docker run -it --privileged --pid=host debian nsenter -t 1 -m -u -n -i sh
     ```

   - **Example:**
     ```bash
     # Attempt container breakout on 'web-container'
     docker run -it --privileged --pid=host web-container nsenter -t 1 -m -u -n -i sh
     ```

## 6. Network Security:

   - **Test Case:** Assess network configurations and security.
   - **Commands/Tools:**
     ```bash
     # List available networks
     docker network ls
     
     # Inspect details of a specific network
     docker network inspect <network-id>
     ```

   - **Example:**
     ```bash
     # Inspect details of the 'backend-network'
     docker network inspect backend-network
     ```

## 7. Resource Utilization:

   - **Test Case:** Assess resource utilization and potential denial-of-service (DoS) vulnerabilities.
   - **Commands/Tools:**
     ```bash
     # Display real-time resource usage of a container
     docker stats <container-id>
     ```

   - **Example:**
     ```bash
     # Display resource usage for 'app-container'
     docker stats app-container
     ```

## 8. Docker API Security:

   - **Test Case:** Check for unauthorized access to the Docker API.
   - **Commands/Tools:**
     ```bash
     # Query Docker API for information
     curl -s --unix-socket /var/run/docker.sock http://localhost/info
     ```

   - **Example:**
     ```bash
     # Query Docker API for system information
     curl -s --unix-socket /var/run/docker.sock http://localhost/info
     ```

## 9. Docker Compose Security:

   - **Test Case:** Assess security configurations in Docker Compose files.
   - **Commands/Tools:**
     ```bash
     # Validate and view the configuration of a Docker Compose file
     docker-compose config
     ```

   - **Example:**
     ```bash
     # Validate and view the configuration of 'docker-compose.yml'
     docker-compose -f docker-compose.yml config
     ```

## 10. Orchestration Platform Security:

   - **Test Case:** Evaluate security configurations of the orchestration platform (e.g., Kubernetes).
   - **Commands/Tools:**
     ```bash
     # List pods in a Kubernetes cluster
     kubectl get pods
     
     # Describe details of a specific pod
     kubectl describe pod <pod-name>
     ```

   - **Example:**
     ```bash
     # List pods in the default namespace
     kubectl get pods
     
     # Describe details of the 'web-pod'
     kubectl describe pod web-pod
     ```

## 11. Auditing and Logging:

   - **Test Case:** Evaluate the effectiveness of logging and auditing configurations.
   - **Commands/Tools:**
     ```bash
     # View logs of a running container
     docker logs <container-id>
     ```

   - **Example:**
     ```bash
     # View logs for 'nginx-container'
     docker logs nginx-container
     ```

## 12. Security Monitoring:

   - **Test Case:** Assess the effectiveness of security monitoring solutions.
   - **Commands/Tools:**
     - Utilize third-party security monitoring tools specific to Docker.

## 13. Container Signing and Verification:

   - **Test Case:** Implement container image signing and verify signed images.
   - **Commands/Tools:**
     ```bash
     # Sign a container image
     docker trust sign <image-name>
     
     # Verify a signed container image
     docker trust inspect --pretty <image-name>
     ```

   - **Example:**
     ```bash
     # Sign 'my-app' image
     docker trust sign my-app
     
     # Verify the signed 'my-app' image
     docker trust inspect --pretty my-app
     ```

## 14. Container Runtime Policies:

   - **Test Case:** Enforce and assess runtime policies for containers.
   - **Commands/Tools:**
     ```bash
     # Set runtime policies for a container
     docker run --security-opt <policy-option> <image-name>
     ```

   - **Example:**
     ```bash
     # Run 'secure-app' container with SELinux policy
     docker run --security-opt label=type:container_runtime_t secure-app
     ```

## 15. Container Secrets Management:

   - **Test Case:** Securely manage and assess the handling of secrets within containers.
   - **Commands/Tools:**
     ```bash
     # Create and manage secrets
     docker secret create <secret-name> <file-path>
     ```

   - **Example:**
     ```bash
     # Create a secret named 'db-password' from 'password.txt'
     echo "supersecretpassword" | docker secret create db-password -
     ```

## 16. Container Compliance Scanning:

   - **Test Case:** Scan containers for compliance with industry standards.
   - **Commands/Tools:**
     ```bash
     # Use a container compliance scanning tool
     trivy <image-name>
     ```

   - **Example:**
     ```bash
     # Scan 'my-web-app' image for vulnerabilities
     trivy my-web-app
     ```

## 17. Container Isolation Techniques:

   - **Test Case:** Evaluate and enforce container isolation techniques.
   - **Commands/Tools:**
     ```bash
     # Run container with user namespace isolation
     docker run --userns=host <image-name>
     ```

   - **Example:**
     ```bash
     # Run 'isolated-app' with user namespace isolation
     docker run --userns=host isolated-app
     ```

## 18. Container Filesystem Permissions:

   - **Test Case:** Assess and enforce filesystem permissions within containers.
   - **Commands/Tools:**
     ```bash
     # Run container with specific filesystem permissions
     docker run --read-only <image-name>
     ```

   - **Example:**
     ```bash
     # Run 'readonly-app' with read-only filesystem
     docker run --read-only readonly-app
     ```

## 19. Container Image Tagging Best Practices:

   - **Test Case:** Implement and assess best practices for tagging container images.
   - **Commands/Tools:**
     ```bash
     # Tag a container image with version information
     docker tag <image-name> <image-name>:<version>
     ```

   - **Example:**
     ```bash
     # Tag 'backend-service' image with version 'v1.0'
     docker tag backend-service backend-service:v1.0
     ```

## 20. Container Backup and Recovery:

   - **Test Case:** Implement and assess backup and recovery procedures for containers.
   - **Commands/Tools:**
     ```bash
     # Backup a container's data volume
     docker run --volumes-from <container-id> -v $(pwd):/backup busybox tar cvf /backup/backup.tar /data
     ```

   - **Example:**
     ```bash
     # Backup 'database-container' data volume
     docker run --volumes-from database-container -v $(pwd):
