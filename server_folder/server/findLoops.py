import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import networkx as nx
from collections import defaultdict
import sys
import json

#actorshare = pd.read_csv("/Users/eshankabir/Documents/code/Actorshare Algorithm Training Data - Base Case.csv")

#initiailize graph: start with actors as verticies, then if actor 1 depends on actor 2 to be called,
#create directed edge from actor 1 to actor 2.
def findLoops(actorshare):

    actor_names = pd.Series(actorshare.drop(columns="Role").values.flatten()).unique()
    actor_names = actor_names[~pd.isna(actor_names)]

    G = nx.DiGraph()
    G.add_nodes_from(actor_names)

    #edge initialization, runtime O(N^2)
    for actor in actor_names:
        for index, row in actorshare.iterrows():
            if actor in row[2:].values:
                G.add_edge(actor, row[1], role=row[0])

    #finding call list, runtime O(N)
    call_list = []
    for actor in actor_names:
        if len(G.out_edges(actor)) == 0: call_list.append(actor)

    return {
        "status": "success",
        "call_list": call_list
    }

    #finding chordless cycles in graph, runtime O((N+E)(C+1))
    if len(call_list) == 0:
        cycles = nx.chordless_cycles(G)
        for cycle in cycles:
            display = "["
            for i in range(len(cycle)):
                actor = cycle[i]
                relationship = G.edges[cycle[i-1], actor]['role']
                display = display + actor + ", " + relationship + "; "
            display = display + "]"
            print(display)

if __name__ == "__main__":
    csv_input_data = sys.stdin.read()
    output_data = findLoops(csv_input_data)
    print(json.dumps(output_data))
    sys.stdout.flush()

